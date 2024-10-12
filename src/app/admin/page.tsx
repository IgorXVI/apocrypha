import { db } from "~/server/db"
import DataTable from "./_components/data-table"
import { calcDeliveryLocalDate, calcSkip } from "~/lib/utils"
import { type User } from "@clerk/nextjs/server"
import { authClient } from "~/server/auth-api"
import { emitTicket, getProductInfo } from "~/server/shipping-api"
import { revalidatePath } from "next/cache"

export default async function Admin({
    searchParams,
}: {
    searchParams: {
        page?: string
    }
}) {
    const currentPage = Number(searchParams.page) || 1

    const currentTake = 10

    const [orders, total] = await Promise.all([
        db.order.findMany({
            take: currentTake,
            skip: calcSkip(currentPage, currentTake),
            orderBy: {
                createdAt: "desc",
            },
        }),
        db.order.count(),
    ])

    const orderToUserIdMap = new Map<string, string>()

    const userIds: string[] = []

    orders.forEach((order) => {
        userIds.push(order.userId)
        orderToUserIdMap.set(order.id, order.userId)
    })

    const users = await authClient.users.getUserList({
        userId: userIds,
        limit: userIds.length,
    })

    const userMap = new Map<string, User>()

    users.data.forEach((user) => {
        userMap.set(user.id, user)
    })

    const odersForView = orders.map((order) => ({
        id: order.id,
        status: order.status === "CANCELED" ? `${order.status} : ${order.cancelReason ?? "N/A"} - ${order.cancelMessage ?? "N/A"}` : order.status,
        userName: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.fullName,
        userEmail: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.primaryEmailAddress?.emailAddress,
        price: `R$ ${order.totalPrice.toFixed(2)}`,
        stripeLink: order.paymentId && (
            <a
                className="hover:underline"
                href={`https://dashboard.stripe.com/test/payments/${order.paymentId}`}
            >
                Ver no Stripe
            </a>
        ),
        ticketId: order.ticketId,
        shippingMethod: order.shippingServiceName,
        estimatedDelivery: calcDeliveryLocalDate(order),
        createdAt: order.createdAt.toLocaleString(),
        printLink: order.printUrl && (
            <a
                className="hover:underline"
                href={order.printUrl}
            >
                Ver PDF
            </a>
        ),
        tracking: order.tracking,
    }))

    return (
        <div className="container flex flex-col gap-5 py-5">
            <DataTable
                name="pedido"
                namePlural="pedidos"
                tableDescription="Atualize os pedidos."
                tableHeaders={{
                    id: "ID",
                    createdAt: "Data de criação",
                    status: "Status",
                    estimatedDelivery: "Data de entrega (aproximada)",
                    stripeLink: "Informações do pagamento no Stripe",
                    printLink: "Ver Ticket do Super Frete",
                    tracking: "Código de rastreamento",
                    price: "Valor pago no Stripe",
                    ticketId: "ID do Ticket",
                    shippingMethod: "Serviço de entrega",
                    userName: "Nome do usuário",
                    userEmail: "Email do usuário",
                }}
                rows={odersForView}
                isError={false}
                isSuccess={true}
                isLoading={false}
                pagination={{
                    urlPageParamName: "page",
                    total,
                    page: currentPage,
                    take: currentTake,
                }}
                tableRowActions={{
                    label: "Atualizar pedido",
                    actions: [
                        {
                            label: "Emitir Ticket",
                            serverAction: async (id: unknown) => {
                                "use server"
                                if (typeof id !== "string") {
                                    return {
                                        success: false,
                                        errorMessage: "ID deve ser uma string.",
                                    }
                                }

                                const order = await db.order.findUnique({
                                    where: {
                                        id,
                                    },
                                })

                                if (!order) {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido não foi encontrado.",
                                    }
                                }

                                const ticketEmitedResult = await emitTicket(order.ticketId).catch((error) => {
                                    console.error("EMIT_TICKET_ON_ADMIN_ERROR", error)
                                    return undefined
                                })

                                if (typeof ticketEmitedResult === "string") {
                                    return {
                                        success: false,
                                        errorMessage: `Mensagem do Super Frete: ${ticketEmitedResult}`,
                                    }
                                }

                                if (!ticketEmitedResult) {
                                    return {
                                        success: false,
                                        errorMessage: "Aconteceu um erro ao tentar emitir o ticket.",
                                    }
                                }

                                const updateResult = await db.order
                                    .update({
                                        where: {
                                            id,
                                        },
                                        data: {
                                            printUrl: ticketEmitedResult.printUrl,
                                        },
                                    })
                                    .catch((error) => {
                                        console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
                                        return undefined
                                    })

                                if (!updateResult) {
                                    return {
                                        success: false,
                                        errorMessage: "Aconteceu um erro ao atualizar o pedido.",
                                    }
                                }

                                revalidatePath("/admin")

                                return {
                                    success: true,
                                }
                            },
                        },
                        {
                            label: "Inferir novo Status",
                            serverAction: async (id: unknown) => {
                                "use server"
                                if (typeof id !== "string") {
                                    return {
                                        success: false,
                                        errorMessage: "ID deve ser uma string.",
                                    }
                                }

                                const order = await db.order.findUnique({
                                    where: {
                                        id,
                                    },
                                })

                                if (!order) {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido não foi encontrado.",
                                    }
                                }

                                const ticketInfo = await getProductInfo(order.ticketId).catch((error) => {
                                    console.error("GET_TICKET_INFO_ON_ADMIN_ERROR", error)
                                    return undefined
                                })

                                if (!ticketInfo) {
                                    return {
                                        success: false,
                                        errorMessage: "Não foi possível buscar as informações do ticket no Super Frete.",
                                    }
                                }

                                const updateResult = await db.order
                                    .update({
                                        where: {
                                            id,
                                        },
                                        data: {
                                            tracking: ticketInfo.tracking,
                                            status: ticketInfo.status && ticketInfo.tracking ? "IN_TRANSIT" : "PREPARING",
                                        },
                                    })
                                    .catch((error) => {
                                        console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
                                        return undefined
                                    })

                                if (!updateResult) {
                                    return {
                                        success: false,
                                        errorMessage: "Aconteceu um erro ao atualizar o pedido.",
                                    }
                                }

                                revalidatePath("/admin")

                                return {
                                    success: true,
                                }
                            },
                        },
                        {
                            label: "Simular Entrega",
                            serverAction: async (id: unknown) => {
                                "use server"
                                if (typeof id !== "string") {
                                    return {
                                        success: false,
                                        errorMessage: "ID deve ser uma string.",
                                    }
                                }

                                const order = await db.order.findUnique({
                                    where: {
                                        id,
                                    },
                                })

                                if (!order) {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido não foi encontrado.",
                                    }
                                }

                                const updateResult = await db.order
                                    .update({
                                        where: {
                                            id,
                                        },
                                        data: {
                                            status: order.status === "IN_TRANSIT" ? "DELIVERED" : order.status,
                                        },
                                    })
                                    .catch((error) => {
                                        console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
                                        return undefined
                                    })

                                if (!updateResult) {
                                    return {
                                        success: false,
                                        errorMessage: "Aconteceu um erro ao atualizar o pedido.",
                                    }
                                }

                                revalidatePath("/admin")

                                return {
                                    success: true,
                                }
                            },
                        },
                    ],
                }}
            ></DataTable>
        </div>
    )
}

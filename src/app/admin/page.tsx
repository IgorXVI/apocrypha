import { db } from "~/server/db"
import DataTable from "./_components/data-table"
import { calcSkip } from "~/lib/utils"
import { type User } from "@clerk/nextjs/server"
import { authClient } from "~/server/auth-api"
import { cancelTicket, emitTicket, getProductInfo } from "~/server/shipping-api"
import { revalidatePath } from "next/cache"
import OrderStatus from "~/components/order/order-status"
import OrderSearch from "./_components/order-search"
import { type $Enums } from "prisma/prisma-client"
import { z } from "zod"
import { stripe } from "~/server/stripe-api"

const orderStatusSearch = new Map<string, $Enums.OrderStatus>([
    ["entregue", "DELIVERED"],
    ["cancelado", "CANCELED"],
    ["a caminho", "IN_TRANSIT"],
    ["preparando", "PREPARING"],
    ["reembolso sendo avaliado", "REFUND_REQUESTED"],
    ["reembolso foi feito", "REFUND_ACCEPTED"],
    ["reembolso foi recusado", "REFUND_DENIED"],
])

export default async function Admin({
    searchParams,
}: {
    searchParams: {
        page?: string
        searchTerm?: string
    }
}) {
    const currentPage = Number(searchParams.page) || 1

    const currentTake = 10

    const UUIDValidation = z.string().uuid()
    const searchTermIsUUIDResult = UUIDValidation.safeParse(searchParams.searchTerm)
    const idSearch = searchTermIsUUIDResult.success ? searchParams.searchTerm : undefined

    const [orders, total] = await Promise.all([
        db.order
            .findMany({
                take: currentTake,
                skip: calcSkip(currentPage, currentTake),
                where: searchParams.searchTerm
                    ? {
                          OR: [
                              {
                                  id: idSearch,
                              },
                              {
                                  status: {
                                      equals: orderStatusSearch.get(searchParams.searchTerm?.toLowerCase() ?? ""),
                                  },
                              },
                              {
                                  userId: searchParams.searchTerm,
                              },
                              {
                                  sessionId: searchParams.searchTerm,
                              },
                          ],
                      }
                    : undefined,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    BookOnOrder: true,
                },
            })
            .catch((error) => {
                console.error("ADMIN_ORDER_SEARCH_ERROR", error)
                return []
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
        status: <OrderStatus status={order.status}></OrderStatus>,
        booksLink: (
            <a
                className="hover:underline text-nowrap"
                href={`/admin/book?search=IDS-->${order.BookOnOrder.map((bo) => bo.bookId).join("__AND__")}`}
            >
                Ver livros
            </a>
        ),
        userName: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.fullName,
        userEmail: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.primaryEmailAddress?.emailAddress,
        price: `R$ ${order.totalPrice.toFixed(2)}`,
        stripeLink: order.paymentId && (
            <a
                className="hover:underline text-nowrap"
                href={`https://dashboard.stripe.com/test/payments/${order.paymentId}`}
            >
                Ver no Stripe
            </a>
        ),
        ticketId: order.ticketId,
        shippingMethod: order.shippingServiceName,
        updatedAt: order.updatedAt.toLocaleString(),
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
            <div className="flex flex-row justify-end">
                <OrderSearch paramName="searchTerm"></OrderSearch>
            </div>
            <DataTable
                name="pedido"
                namePlural="pedidos"
                tableDescription="Atualize os pedidos."
                tableHeaders={{
                    id: "ID",
                    status: "Status",
                    booksLink: "Livros",
                    createdAt: "Data de criação",
                    updatedAt: "Data da útlima atualização",
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

                                if (order.status === "CANCELED") {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido está cancelado.",
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
                                            updatedAt: new Date(),
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

                                if (order.status === "CANCELED") {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido está cancelado.",
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
                                            updatedAt: new Date(),
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

                                if (order.status === "CANCELED") {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido está cancelado.",
                                    }
                                }

                                const updateResult = await db.order
                                    .update({
                                        where: {
                                            id,
                                        },
                                        data: {
                                            status: order.status === "IN_TRANSIT" ? "DELIVERED" : order.status,
                                            updatedAt: new Date(),
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
                            label: "Cancelar",
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

                                if (order.status === "CANCELED") {
                                    return {
                                        success: false,
                                        errorMessage: "Pedido está cancelado.",
                                    }
                                }

                                let stripeRefundResult = await stripe.refunds
                                    .list({
                                        payment_intent: order.paymentId,
                                    })
                                    .then((res) => res.data[0])

                                if (!stripeRefundResult) {
                                    stripeRefundResult = await stripe.refunds
                                        .create({
                                            payment_intent: order.paymentId,
                                        })
                                        .catch((error) => {
                                            console.error("CREATE_STRIPE_REFUND_ON_ADMIN_ERROR", error)
                                            return undefined
                                        })
                                }

                                if (!stripeRefundResult) {
                                    return {
                                        success: false,
                                        errorMessage: "Erro ao tentar criar o reembolso no stripe.",
                                    }
                                }

                                if (stripeRefundResult.status !== "pending" && stripeRefundResult.status !== "succeeded") {
                                    return {
                                        success: false,
                                        errorMessage: `Erro ao tentar criar o reembolso no stripe, status retornado: ${stripeRefundResult.status}`,
                                    }
                                }

                                const ticketInfo = await cancelTicket(order.ticketId).catch((error) => {
                                    console.error("GET_TICKET_INFO_ON_ADMIN_ERROR", error)
                                    return "ERRO"
                                })

                                if (typeof ticketInfo === "string") {
                                    return {
                                        success: false,
                                        errorMessage: "Não foi possível cancelar o ticket no Super Frete.",
                                    }
                                }

                                const transactionResult = await db
                                    .$transaction(async (transaction) => {
                                        const booksOnOrder = await transaction.bookOnOrder.findMany({
                                            where: {
                                                orderId: id,
                                            },
                                        })

                                        const booksStock = await transaction.book.findMany({
                                            where: {
                                                id: {
                                                    in: booksOnOrder.map((bo) => bo.bookId),
                                                },
                                            },
                                            select: {
                                                id: true,
                                                stock: true,
                                            },
                                        })

                                        const bookUpdates = await Promise.allSettled(
                                            booksStock.map((bs) =>
                                                transaction.book.update({
                                                    where: {
                                                        id: bs.id,
                                                    },
                                                    data: {
                                                        stock: (booksOnOrder.find((bo) => bo.bookId === bs.id)?.amount ?? 0) + bs.stock,
                                                    },
                                                }),
                                            ),
                                        )

                                        bookUpdates.forEach((bu) => {
                                            if (bu.status === "rejected") {
                                                throw bu.reason
                                            }
                                        })

                                        await transaction.order.update({
                                            where: {
                                                id,
                                            },
                                            data: {
                                                status: "CANCELED",
                                                cancelReason: "ADMIN",
                                                updatedAt: new Date(),
                                            },
                                        })

                                        return true
                                    })
                                    .catch((error) => {
                                        console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
                                        return false
                                    })

                                if (!transactionResult) {
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

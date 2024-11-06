import { db } from "~/server/db"
import DataTable from "../_components/data-table"
import { calcSkip } from "~/lib/utils"
import { type User } from "@clerk/nextjs/server"
import { authClient } from "~/server/auth-api"
import OrderStatus from "~/components/order/order-status"
import ParamsSearch from "../_components/params-search"
import { type $Enums } from "prisma/prisma-client"
import { z } from "zod"
import { cancelOrder, emitOrderTicket, inferNewOrderStatus, simulateOrderDone, simulateStripeConfirmation } from "~/server/actions/order"
import Link from "next/link"

const orderStatusSearch = new Map<string, $Enums.OrderStatus>([
    ["entregue", "DELIVERED"],
    ["cancelado", "CANCELED"],
    ["a caminho", "IN_TRANSIT"],
    ["preparando", "PREPARING"],
    ["reembolso sendo avaliado", "REFUND_REQUESTED"],
    ["reembolso foi feito", "REFUND_ACCEPTED"],
    ["reembolso foi recusado", "REFUND_DENIED"],
])

export default async function OrdersPage({
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
        detailsLink: (
            <Link
                className="hover:underline text-nowrap"
                href={`/admin/orders/${order.id}`}
            >
                Ver detalhes
            </Link>
        ),
        status: <OrderStatus status={order.status}></OrderStatus>,
        booksLink: (
            <Link
                className="hover:underline text-nowrap"
                href={`/admin/book?search=IDS-->${order.BookOnOrder.map((bo) => bo.bookId).join("__AND__")}`}
            >
                Ver livros
            </Link>
        ),
        userName: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.fullName,
        userEmail: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.primaryEmailAddress?.emailAddress,
        price: order.totalPrice ? `R$ ${order.totalPrice.toFixed(2)}` : undefined,
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
        updatedAt: order.updatedAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        createdAt: order.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        printLink: order.printUrl && (
            <a
                className="hover:underline"
                href={order.printUrl}
            >
                Ver PDF
            </a>
        ),
        tracking: order.tracking,
        cancelReason: order.cancelReason,
        cancelMessage: order.cancelMessage,
    }))

    return (
        <div className="container flex flex-col gap-5 py-5">
            <div className="flex flex-row justify-end">
                <ParamsSearch paramName="searchTerm"></ParamsSearch>
            </div>
            <DataTable
                name="pedido"
                namePlural="pedidos"
                tableDescription="Atualize os pedidos."
                tableHeaders={{
                    detailsLink: "Detalhes do pedido",
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
                    cancelReason: "Motivo do cancelamento",
                    cancelMessage: "Mensagem de cancelamento",
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
                            serverAction: emitOrderTicket,
                        },
                        {
                            label: "Inferir novo Status",
                            serverAction: inferNewOrderStatus,
                        },
                        {
                            label: "Simular Entrega",
                            serverAction: simulateOrderDone,
                        },
                        {
                            label: "Simular Webhook do Stripe",
                            serverAction: simulateStripeConfirmation,
                        },
                        {
                            label: "Cancelar",
                            serverAction: cancelOrder,
                        },
                    ],
                }}
            ></DataTable>
        </div>
    )
}

import { db } from "~/server/db"
import DataTable from "./_components/data-table"
import { calcSkip } from "~/lib/utils"
import { type User } from "@clerk/nextjs/server"
import { authClient } from "~/server/auth-api"

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
            orderBy: [
                {
                    needsRefund: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        }),
        db.order.count(),
    ])

    const getDateOffset = (date: Date, offsetInDays: number) => new Date(date.getTime() + offsetInDays * 24 * 60 * 60 * 1000).toLocaleDateString()

    const calcShippingDate = (createdAt: Date, min: number, max: number) =>
        min === max ? getDateOffset(createdAt, min) : `Entre ${getDateOffset(createdAt, min)} e ${getDateOffset(createdAt, max)}`

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
        refundOk: !order.needsRefund,
        refundStatus: order.refundStatus,
        status: order.status === "CANCELED" ? `${order.status} : ${order.cancelReason ?? "N/A"} - ${order.cancelMessage ?? "N/A"}` : order.status,
        userName: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.fullName,
        userEmail: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.primaryEmailAddress?.emailAddress,
        price: `R$ ${order.totalPrice.toFixed(2)}`,
        stripeLink: order.stripePaymentId && (
            <a
                className="hover:underline"
                href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentId}`}
            >
                Ver no Stripe
            </a>
        ),
        ticketId: order.ticketId,
        shippingMethod: order.shippingServiceName,
        estimatedDelivery: calcShippingDate(order.createdAt, order.shippingDaysMin, order.shippingDaysMax),
        createdAt: order.createdAt.toLocaleString(),
        printLink: order.printUrl && (
            <a
                className="hover:underline"
                href={order.printUrl}
            >
                Ver PDF
            </a>
        ),
        ticketStatus: order.ticketStatus,
        tracking: order.tracking,
        ticketUpdatedAt: order.ticketUpdatedAt && new Date(order.ticketUpdatedAt).toLocaleString(),
        ticketEmitPrice: order.ticketPrice && `R$ ${order.ticketPrice?.toFixed(2)}`,
    }))

    return (
        <div className="container flex flex-col gap-5 py-5">
            <DataTable
                name="pedido"
                namePlural="pedidos"
                tableDescription="Crie, atualize, apague ou busque pedidos."
                tableHeaders={{
                    id: "ID",
                    refundOk: "Reembolso está OK?",
                    refundStatus: "Status do reembolso no stripe",
                    createdAt: "Data de criação",
                    status: "Status",
                    ticketStatus: "Status no Super Frete",
                    stripeLink: "Informações do pagamento no Stripe",
                    printLink: "Ver Ticket do Super Frete",
                    tracking: "Código de rastreamento",
                    ticketUpdatedAt: "Última atualização do Ticket",
                    price: "Valor pago no Stripe",
                    ticketEmitPrice: "Valor para emitr o Ticket do Super Frete",
                    ticketId: "ID do Ticket",
                    shippingMethod: "Serviço de entrega",
                    estimatedDelivery: "Data de entrega (aproximada)",
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
            ></DataTable>
        </div>
    )
}

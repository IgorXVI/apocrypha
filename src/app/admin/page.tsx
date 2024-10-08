import { db } from "~/server/db"
import DataTable from "./_components/data-table"
import { calcSkip } from "~/lib/utils"
import { clerkClient, type User } from "@clerk/nextjs/server"
import { type GetProductInfoOutput, getProductsInfo } from "~/server/shipping-api"

const cClient = clerkClient()

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

    const getDateOffset = (date: Date, offsetInDays: number) => new Date(date.getTime() + offsetInDays * 24 * 60 * 60 * 1000).toLocaleDateString()

    const calcShippingDate = (createdAt: Date, min: number, max: number) =>
        min === max ? getDateOffset(createdAt, min) : `Entre ${getDateOffset(createdAt, min)} e ${getDateOffset(createdAt, max)}`

    const orderToUserIdMap = new Map<string, string>()

    const userIds: string[] = []

    orders.forEach((order) => {
        userIds.push(order.userId)
        orderToUserIdMap.set(order.id, order.userId)
    })

    const users = await cClient.users.getUserList({
        userId: userIds,
        limit: userIds.length,
    })

    const userMap = new Map<string, User>()

    users.data.forEach((user) => {
        userMap.set(user.id, user)
    })

    const ticketIds = orders.filter((order) => order.ticketId).map((order) => order.ticketId)

    const productsInfo = await getProductsInfo(ticketIds)

    const ticketToInfoMap = new Map<string, GetProductInfoOutput>()

    productsInfo.forEach((info) => {
        ticketToInfoMap.set(info.ticketId, info)
    })

    const odersForView = orders.map((order) => ({
        id: order.id,
        userFirstName: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.firstName,
        userLastName: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.lastName,
        userEmail: userMap.get(orderToUserIdMap.get(order.id) ?? "")?.primaryEmailAddress?.emailAddress,
        price: `R$ ${order.totalPrice.toFixed(2)}`,
        stripeLink: (
            <a
                className="hover:underline"
                href={`https://dashboard.stripe.com/test/payments/${order.paymentId}`}
            >
                Ver no Stripe
            </a>
        ),
        ticketId: order.ticketId,
        shippingMethod: order.shippingServiceName,
        estimatedDelivery: calcShippingDate(order.createdAt, order.shippingDaysMin, order.shippingDaysMax),
        createdAt: order.createdAt,
        printLink: order.printUrl ? (
            <a
                className="hover:underline"
                href={order.printUrl}
            >
                Imprimir
            </a>
        ) : undefined,
        status: ticketToInfoMap.get(order.ticketId)?.status,
        tracking: ticketToInfoMap.get(order.ticketId)?.tracking,
        ticketUpdatedAt: new Date(ticketToInfoMap.get(order.ticketId)?.updatedAt ?? "").toLocaleString(),
    }))

    return (
        <div className="container flex flex-col gap-5 py-5">
            <DataTable
                name="pedido"
                namePlural="pedidos"
                tableDescription="Crie, atualize, apague ou busque pedidos."
                tableHeaders={{
                    status: "Status",
                    price: "Valor pago no Stripe",
                    stripeLink: "Informações do pagamento no Stripe",
                    ticketId: "ID do Ticket",
                    printLink: "Imprimir Ticket",
                    shippingMethod: "Serviço de entrega",
                    tracking: "Código de rastreamento",
                    createdAt: "Data de criação",
                    ticketUpdatedAt: "Última atualização do Ticket",
                    estimatedDelivery: "Data de entrega (aproximada)",
                    userFirstName: "Nome do usuário",
                    userLastName: "Sobrenome do usuário",
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

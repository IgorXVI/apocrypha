import "server-only"

import { emitTicket, getProductInfo, type GetProductInfoOutput } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"
import { type Prisma, type $Enums } from "prisma/prisma-client"
import { db } from "./db"
import { env } from "~/env"

type SessionInfo = {
    paymentId: string | undefined
    paymentStatus: "paid" | "unpaid" | "no_payment_required"
    status: "expired" | "complete" | "open" | undefined
}

type RefundInfo = {
    needsRefund: boolean
    refundStatus: string
}

type OrderNewStatusInfo = {
    status: $Enums.OrderStatus
    cancelReason?: $Enums.OrderCancelReason
    cancelMessage?: string
    stripePaymentId?: string
    ticketStatus?: string
    ticketUpdatedAt?: string
    tracking?: string
    ticketPrice?: number
    printUrl?: string
    needsRefund?: boolean
}

const checkNeedsRefund = (session: SessionInfo) => session.paymentId !== undefined && session.paymentStatus === "paid"

export const updateOrderStatus = async (order: Prisma.OrderGetPayload<Prisma.OrderDefaultArgs>) => {
    const sessionFromStripe = await stripe.checkout.sessions.retrieve(order.sessionId)

    if (!order.ticketId || !sessionFromStripe || sessionFromStripe.status !== "complete") {
        await db.bookOnOrder.deleteMany({
            where: {
                orderId: order.id,
            },
        })

        await db.order.delete({ where: { id: order.id } })

        return
    }

    const session: SessionInfo = {
        paymentId: sessionFromStripe.payment_intent?.toString(),
        paymentStatus: sessionFromStripe.payment_status,
        status: sessionFromStripe.status ?? undefined,
    }

    const ticketInfo: GetProductInfoOutput = await getProductInfo(order.ticketId)

    let orderNewStatus: OrderNewStatusInfo = {
        status: "PREPARING",
        stripePaymentId: session.paymentId,
        ticketPrice: ticketInfo.price,
        ticketStatus: ticketInfo.status,
        ticketUpdatedAt: ticketInfo.updatedAt,
        tracking: ticketInfo.tracking,
        needsRefund: false,
    }

    if (ticketInfo.status === "canceled") {
        if (order.status === "TICKET_EMITED" && env.SUPER_FRETE_URL.startsWith("https://sandbox")) {
            orderNewStatus = {
                ...orderNewStatus,
                status: "IN_TRANSIT",
            }
        } else {
            orderNewStatus = {
                ...orderNewStatus,
                status: "CANCELED",
                cancelReason: "SHIPPING_SERVICE",
                cancelMessage: `Ticket ${order.ticketId} is canceled.`,
                needsRefund: checkNeedsRefund(session),
            }
        }
    } else if (ticketInfo.status === "released") {
        orderNewStatus = {
            ...orderNewStatus,
            status: "TICKET_EMITED",
        }
    } else if (ticketInfo.status === "pending") {
        const result = await emitTicket(order.ticketId)

        if (result) {
            orderNewStatus = {
                ...orderNewStatus,
                status: "AWAITING_EMISSION",
                printUrl: result.printUrl,
            }
        }
    }

    let refundInfo: RefundInfo | undefined

    if (orderNewStatus.needsRefund) {
        const refund = await stripe.refunds
            .list({
                payment_intent: session.paymentId,
            })
            .then((res) => res.data[0])

        const refundOk = new Map<string, boolean>([
            ["pending", true],
            ["succeeded", true],
            ["requires_action", false],
            ["failed", false],
            ["canceled", false],
        ])

        const hasRefund = refund && refundOk.get(refund.status ?? "")
        refundInfo = {
            needsRefund: !hasRefund,
            refundStatus: refund?.status ?? "stripe_has_none",
        }
    }

    await db.order.update({
        where: {
            id: order.id,
        },
        data: {
            status: orderNewStatus.status ?? "PREPARING",
            cancelReason: orderNewStatus.cancelReason,
            cancelMessage: orderNewStatus.cancelMessage,
            stripePaymentId: orderNewStatus.stripePaymentId,
            ticketPrice: orderNewStatus.ticketPrice,
            ticketStatus: orderNewStatus.ticketStatus,
            ticketUpdatedAt: orderNewStatus.ticketUpdatedAt,
            tracking: orderNewStatus.tracking,
            printUrl: orderNewStatus.printUrl,
            needsRefund: refundInfo?.needsRefund ?? false,
            refundStatus: refundInfo?.refundStatus,
            updatedAt: new Date(),
        },
    })
}

export const updateAllOrders = async () => {
    const orders = await db.order
        .findMany({
            where: {
                AND: [
                    {
                        status: {
                            notIn: ["IN_TRANSIT", "DELIVERED"],
                        },
                    },
                    {
                        NOT: {
                            status: "CANCELED",
                            refundStatus: "succeeded",
                        },
                    },
                ],
            },
        })
        .catch((error) => {
            console.error("ORDER_STATUS_FIND_MANY_ERROR", error)
            return []
        })

    const result = { updateOrders: orders.length }

    if (orders.length === 0) {
        return result
    }

    await Promise.all(orders.map((order) => updateOrderStatus(order).catch((error) => console.error("ORDER_STATUS_UPDATE_ERROR", error))))

    return result
}

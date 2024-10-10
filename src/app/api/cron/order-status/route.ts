import { db } from "~/server/db"
import { cronAuthCheck, unauthorizedRes } from "../core"
import { cancelTicket, emitTicket, getProductInfo } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"
import { type Prisma, type $Enums } from "prisma/prisma-client"

export const dynamic = "force-dynamic"

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
    stripeStatus?: string
    stripePaymentId?: string
    ticketStatus?: string
    ticketUpdatedAt?: Date
    tracking?: string
    ticketPrice?: number
    printUrl?: string
    needsRefund?: boolean
}

const reqCancelTicket = (ticketId: string) =>
    cancelTicket(ticketId)
        .then(() => undefined)
        .catch((error) => {
            console.error("CANCEL_TICKET_ERROR", error)
            return undefined
        })

const reqEmitTicket = (ticketId: string) =>
    emitTicket(ticketId).catch((error) => {
        console.error("CANCEL_TICKET_ERROR", error)
        return undefined
    })

const checkNeedsRefund = (session?: SessionInfo) => session?.paymentId !== undefined && session?.paymentStatus === "paid"

const updateOrderStatus = async (order: Prisma.OrderGetPayload<Prisma.OrderDefaultArgs>) => {
    const [ticketInfo, sessionFromStripe] = await Promise.all([getProductInfo(order.ticketId), stripe.checkout.sessions.retrieve(order.sessionId)])

    const session: SessionInfo = {
        paymentId: sessionFromStripe.payment_intent?.toString(),
        paymentStatus: sessionFromStripe.payment_status,
        status: sessionFromStripe.status ?? undefined,
    }

    let orderNewStatus: OrderNewStatusInfo | undefined

    if (!ticketInfo) {
        orderNewStatus = {
            status: "CANCELED",
            cancelReason: "SHIPPING_SERVICE",
            cancelMessage: `Ticket ${order.ticketId} not found.`,
            stripePaymentId: session?.paymentId,
            stripeStatus: session?.status,
            needsRefund: checkNeedsRefund(session),
        }
    } else if (ticketInfo.status === "canceled") {
        orderNewStatus = {
            status: "CANCELED",
            cancelReason: "SHIPPING_SERVICE",
            cancelMessage: `Ticket ${order.ticketId} is canceled.`,
            ticketPrice: ticketInfo.price,
            ticketStatus: ticketInfo.status,
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            stripePaymentId: session?.paymentId,
            stripeStatus: session?.status,
            needsRefund: checkNeedsRefund(session),
        }
    } else if (!session) {
        if (ticketInfo.status !== "canceled") {
            await reqCancelTicket(order.ticketId)
        }

        orderNewStatus = {
            status: "CANCELED",
            cancelReason: "STRIPE",
            cancelMessage: `Stripe session ${order.sessionId} not found.`,
            ticketPrice: ticketInfo.price,
            ticketStatus: "canceled",
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
        }
    } else if (session.status === "expired") {
        if (ticketInfo.status !== "canceled") {
            await reqCancelTicket(order.ticketId)
        }

        orderNewStatus = {
            status: "CANCELED",
            cancelReason: "STRIPE",
            cancelMessage: `Stripe session ${order.ticketId} expired.`,
            ticketPrice: ticketInfo.price,
            ticketStatus: "canceled",
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            stripePaymentId: session.paymentId,
            stripeStatus: session.status,
            needsRefund: checkNeedsRefund(session),
        }
    } else if (ticketInfo.status === "pending") {
        const ticketEmitResult = await reqEmitTicket(order.ticketId)
        if (ticketEmitResult) {
            orderNewStatus = {
                status: "TICKET_EMITED",
                stripeStatus: session.status,
                stripePaymentId: session.paymentId,
                ticketPrice: ticketEmitResult.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketEmitResult.tracking,
                printUrl: ticketEmitResult.printUrl,
                needsRefund: false,
            }
        }
    } else if (ticketInfo.status === "released") {
        orderNewStatus = {
            status: "TICKET_EMITED",
            stripeStatus: session.status,
            stripePaymentId: session.paymentId,
            ticketPrice: ticketInfo.price,
            ticketStatus: ticketInfo.status,
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            needsRefund: false,
        }
    }

    if (!orderNewStatus) {
        orderNewStatus = {
            status: order.status,
            stripeStatus: session.status,
            stripePaymentId: session.paymentId,
            ticketPrice: ticketInfo.price,
            ticketStatus: ticketInfo.status,
            ticketUpdatedAt: new Date(ticketInfo.updatedAt),
            tracking: ticketInfo.tracking,
            needsRefund: order.status === "CANCELED" ? checkNeedsRefund(session) : false,
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

        const hasRefund = refund && refundOk.get(refund?.status ?? "")
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
            stripeStatus: orderNewStatus.stripeStatus,
            stripePaymentId: orderNewStatus.stripePaymentId,
            ticketPrice: orderNewStatus.ticketPrice,
            ticketStatus: orderNewStatus.ticketStatus,
            ticketUpdatedAt: orderNewStatus.ticketUpdatedAt,
            tracking: orderNewStatus.tracking,
            printUrl: orderNewStatus.printUrl,
            needsRefund: refundInfo?.needsRefund ?? false,
            refundStatus: refundInfo?.refundStatus,
        },
    })
}

export async function GET(req: Request) {
    const passedAuth = cronAuthCheck(req)

    if (!passedAuth) {
        return unauthorizedRes
    }

    const orders = await db.order.findMany({
        where: {
            AND: [
                {
                    status: {
                        not: "DELIVERED",
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

    if (orders.length === 0) {
        return Response.json({ updateOrders: orders.length })
    }

    await Promise.all(orders.map((order) => updateOrderStatus(order)))

    return Response.json({ updateOrders: orders.length })
}

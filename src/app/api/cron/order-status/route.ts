import { db } from "~/server/db"
import { cronAuthCheck, unauthorizedRes } from "../core"
import { cancelTicket, emitTicket, type EmitTicketOutput, type GetProductInfoOutput, getProductsInfo } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"
import { type Prisma, type $Enums } from "prisma/prisma-client"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    const passedAuth = cronAuthCheck(req)

    if (!passedAuth) {
        return unauthorizedRes
    }

    const orders = await db.order.findMany({
        where: {
            status: {
                not: "CANCELED",
            },
        },
    })

    if (orders.length === 0) {
        return Response.json({ updateOrderIds: [] })
    }

    const ticketIds = orders.filter((order) => order.ticketId).map((order) => order.ticketId)

    const productsInfo = await getProductsInfo(ticketIds)

    const ticketToInfoMap = new Map<string, GetProductInfoOutput>()

    productsInfo.forEach((info) => {
        ticketToInfoMap.set(info.ticketId, info)
    })

    const sessionIds = orders.map((order) => order.sessionId)

    const sessions = await Promise.all(sessionIds.map((sessionId) => stripe.checkout.sessions.retrieve(sessionId)))

    const sessionPaymentMap = new Map<
        string,
        {
            paymentId: string | undefined
            status: "expired" | "complete" | "open" | undefined
        }
    >()

    sessions.forEach((session) => {
        sessionPaymentMap.set(session.id, {
            paymentId: session.payment_intent?.toString(),
            status: session.status ?? undefined,
        })
    })

    const orderNewStatusMap = new Map<
        string,
        {
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
        }
    >()

    const ticketPromises: Promise<EmitTicketOutput | undefined>[] = []
    const reqCancelTicket = (ticketId: string) => {
        ticketPromises.push(
            cancelTicket(ticketId)
                .then(() => undefined)
                .catch((error) => {
                    console.error("CANCEL_TICKET_ERROR", error)
                    return undefined
                }),
        )
    }
    const reqEmitTicket = (ticketId: string) => {
        ticketPromises.push(
            emitTicket(ticketId).catch((error) => {
                console.error("CANCEL_TICKET_ERROR", error)
                return undefined
            }),
        )
    }

    const orderTicketNeedsEmit = new Map<string, Prisma.OrderGetPayload<Prisma.OrderDefaultArgs>>()

    orders.forEach((order) => {
        const session = sessionPaymentMap.get(order.sessionId)
        const ticketInfo = ticketToInfoMap.get(order.ticketId)

        if (!ticketInfo) {
            orderNewStatusMap.set(order.id, {
                status: "CANCELED",
                cancelReason: "SHIPPING_SERVICE",
                cancelMessage: `Ticket ${order.ticketId} not found.`,
            })
            return
        }

        if (ticketInfo.status === "canceled") {
            orderNewStatusMap.set(order.id, {
                status: "CANCELED",
                cancelReason: "SHIPPING_SERVICE",
                cancelMessage: `Ticket ${order.ticketId} is canceled.`,
                ticketPrice: ticketInfo.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketInfo.tracking,
            })
            return
        }

        if (!session) {
            reqCancelTicket(order.ticketId)
            orderNewStatusMap.set(order.id, {
                status: "CANCELED",
                cancelReason: "STRIPE",
                cancelMessage: `Stripe session ${order.sessionId} not found.`,
                ticketPrice: ticketInfo.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketInfo.tracking,
            })
            return
        }

        if (session.status === "expired") {
            reqCancelTicket(order.ticketId)
            orderNewStatusMap.set(order.id, {
                status: "CANCELED",
                cancelReason: "STRIPE",
                cancelMessage: `Stripe session ${order.ticketId} expired.`,
                ticketPrice: ticketInfo.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketInfo.tracking,
                stripePaymentId: session.paymentId,
                stripeStatus: session.status,
            })
            return
        }

        if (ticketInfo.status === "pending") {
            reqEmitTicket(order.ticketId)
            orderTicketNeedsEmit.set(order.ticketId, order)
            return
        }

        if (order.status === "TICKET_EMITED" && (!order.ticketStatus || !order.tracking)) {
            orderNewStatusMap.set(order.id, {
                status: "TICKET_EMITED",
                stripeStatus: session.status,
                stripePaymentId: session.paymentId,
                ticketPrice: ticketInfo.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: ticketInfo.tracking,
            })
            return
        }
    })

    if (ticketPromises.length > 0) {
        const ticketResults = await Promise.all(ticketPromises)

        ticketResults.forEach((result) => {
            if (!result) {
                return
            }

            const order = orderTicketNeedsEmit.get(result.ticketId)

            if (!order) {
                return
            }

            const session = sessionPaymentMap.get(order.sessionId)!
            const ticketInfo = ticketToInfoMap.get(order.ticketId)!

            orderNewStatusMap.set(order.id, {
                status: "TICKET_EMITED",
                stripeStatus: session.status,
                stripePaymentId: session.paymentId,
                ticketPrice: result.price,
                ticketStatus: ticketInfo.status,
                ticketUpdatedAt: new Date(ticketInfo.updatedAt),
                tracking: result.tracking,
                printUrl: result.printUrl,
            })
        })
    }

    const keyVals = [...orderNewStatusMap]

    if (keyVals.length > 0) {
        await Promise.all(
            keyVals.map(([key, values]) =>
                db.order.update({
                    where: {
                        id: key,
                    },
                    data: {
                        status: values.status ?? "PREPARING",
                        cancelReason: values.cancelReason,
                        cancelMessage: values.cancelMessage,
                        stripeStatus: values.stripeStatus,
                        stripePaymentId: values.stripePaymentId,
                        ticketPrice: values.ticketPrice,
                        ticketStatus: values.ticketStatus,
                        ticketUpdatedAt: values.ticketUpdatedAt,
                        tracking: values.tracking,
                        printUrl: values.printUrl,
                    },
                }),
            ),
        )
    }

    return Response.json({ updateOrderIds: [...orderNewStatusMap.keys()] })
}

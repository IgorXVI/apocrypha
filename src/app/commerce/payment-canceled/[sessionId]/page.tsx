import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "~/server/db"
import { cancelTicket } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"

export default async function PaymentCanceled({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce/user/order")
    }

    const [existingOrder, session] = await Promise.all([
        db.order
            .findFirst({
                where: {
                    sessionId,
                    userId: user.userId,
                },
            })
            .catch((error) => {
                console.error("PAYMENT_CANCELED_FIND_DB_ORDER", error)
                return undefined
            }),

        stripe.checkout.sessions.retrieve(sessionId).catch((error) => {
            console.error("PAYMENT_CANCELED_RETRIEV_SESSION", error)
            return undefined
        }),
    ])

    if (!session || session.status === "expired" || !existingOrder) {
        redirect("/commerce/user/order")
    }

    await Promise.all([
        stripe.checkout.sessions.expire(sessionId).catch((error) => {
            console.error("PAYMENT_CANCELED_EXPIRE_STRIPE_SESSION", error)
        }),
        cancelTicket(existingOrder.ticketId).catch((error) => {
            console.error("PAYMENT_CANCELED_CANCEL_TICKET", error)
        }),
    ])

    redirect("/commerce/user/order")
}

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "~/server/db"
import { stripe } from "~/server/stripe-api"

export default async function PaymentCanceled({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce")
    }

    const existingOrder = await db.order
        .findFirst({
            where: {
                sessionId,
                userId: user.userId,
            },
        })
        .catch((error) => {
            console.error("PAYMENT_CANCELED_FIND_DB_ORDER", error)
            return undefined
        })

    if (!existingOrder) {
        redirect("/commerce")
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId).catch((error) => {
        console.error("PAYMENT_CANCELED_RETRIEVE_SESSION", error)
        return undefined
    })

    if (!session || session.status === "expired") {
        redirect("/commerce")
    }

    await db.bookOnOrder
        .deleteMany({
            where: {
                orderId: existingOrder.id,
            },
        })
        .catch((error) => {
            console.error("PAYMENT_CANCELED_DELETE_BOOK_ON_ORDER", error)
        })

    await Promise.all([
        stripe.checkout.sessions.expire(sessionId).catch((error) => {
            console.error("PAYMENT_CANCELED_EXPIRE_STRIPE_SESSION", error)
        }),
        db.order.delete({ where: { id: existingOrder.id } }).catch((error) => {
            console.error("PAYMENT_CANCELED_DELETE_ORDER", error)
        }),
    ])

    redirect("/commerce/cart")
}

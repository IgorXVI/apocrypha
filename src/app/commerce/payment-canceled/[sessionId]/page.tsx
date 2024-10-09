import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { db } from "~/server/db"
import { cancelTicket } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"

export default async function PaymentCanceled({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        return <div>Não autorizado</div>
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
                console.error("FIND_DB_ORDER_ON_CALCEL_ERROR", error)
                return undefined
            }),

        stripe.checkout.sessions.retrieve(sessionId).catch((error) => {
            console.error("RETRIEV_SESSION_ON_CALCEL_ERROR", error)
            return undefined
        }),
    ])

    if (!session || session.status === "expired" || !existingOrder) {
        return <p>Stripe session não é mais válida ou o pedido não foi encontrado.</p>
    }

    await Promise.all([
        stripe.checkout.sessions.expire(sessionId).catch((error) => {
            console.error("EXPIRE_STRIPE_SESSION_ON_CALCEL_ERROR", error)
        }),
        cancelTicket(existingOrder.ticketId).catch((error) => {
            console.error("CANCEL_TICKET_ON_CALCEL_ERROR", error)
        }),
    ])

    return (
        <div className="py-32 flex flex-col items-center space-y-6">
            <p className="text-2xl text-center font-bold text-red-500">O pagamento foi cancelado</p>
            <Link
                href="/commerce"
                className="text-blue-500 text-center"
            >
                Continuar comprando
            </Link>
        </div>
    )
}

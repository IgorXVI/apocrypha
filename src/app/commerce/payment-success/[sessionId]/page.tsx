import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "~/server/db"
import { emitTicket } from "~/server/shipping-api"

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce/user/order")
    }

    const existingOrder = await db.order
        .findFirst({
            where: {
                sessionId,
                userId: user.userId,
            },
        })
        .catch((error) => {
            console.error("PAYMENT_SUCCESS_FIND_DB_ORDER_ERROR", error)
            return null
        })

    if (!existingOrder) {
        redirect("/commerce/user/order")
    }

    if (!existingOrder.printUrl) {
        const emitedTicketInfo = await emitTicket(existingOrder.ticketId).catch((error) => {
            console.error("PAYMENT_SUCCESS_EMIT_TICKET_ERROR", error)
            return undefined
        })

        if (emitedTicketInfo?.printUrl) {
            await db.order
                .update({
                    where: {
                        id: existingOrder.id,
                    },
                    data: {
                        printUrl: emitedTicketInfo.printUrl,
                    },
                })
                .catch((error) => {
                    console.error("PAYMENT_SUCCESS_UPDATE_ORDER_ERROR", error)
                })
        }
    }

    redirect("/commerce/user/order")
}

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "~/server/db"

export default async function PaymentCanceled({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce/cart")
    }

    const exitingOrder = await db.order
        .findFirst({
            where: {
                sessionId,
            },
            select: {
                id: true,
                status: true,
            },
        })
        .catch((error) => {
            console.error("PAYMENT_CANCELED_FIND_EXISTING_ORDER_ERROR:", error)
            return undefined
        })

    if (!exitingOrder || exitingOrder.status !== "AWAITING_CONFIRMATION") {
        redirect("/commerce/cart")
    }

    await db.order
        .delete({
            where: {
                userId: user.userId,
                sessionId,
            },
        })
        .catch((error) => {
            console.error("PAYMENT_CANCELED_DELETE_ORDER_ERROR:", error)
            return undefined
        })

    redirect("/commerce/cart")
}

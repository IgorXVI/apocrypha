import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "~/server/db"

export default async function PaymentSuccess(_: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce/user/order")
    }

    await db.userState
        .update({
            where: {
                userId: user.userId,
            },
            data: {
                bookCart: [],
            },
        })
        .catch((error) => console.error("PAYMENT_SUCCESS_UDPATE_USER_STATE_ERROR:", error))

    redirect("/commerce/user/order")
}

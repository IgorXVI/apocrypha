import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { env } from "~/env"
import { db } from "~/server/db"

function OrderFailedMessage({ sessionId, message }: { sessionId: string; message: string }) {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center text-xl gap-10 p-10">
            <p className="text-red-500 text-6xl font-extrabold">ERRO!</p>
            <p className="text-red-500 font-extrabold text-4xl">{message}</p>
            <p>ID da Stripe Checkout Session: {sessionId}</p>
            <p>Salve o ID e entre em contato com o suporte por email: {env.APP_USER_AGENT}</p>
        </div>
    )
}

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce/user/order")
    }

    const exitingOrder = await db.order
        .findFirst({
            where: {
                sessionId,
            },
            select: {
                id: true,
            },
        })
        .catch((error) => {
            console.error("PAYMENT_SUCCESS_FIND_EXISTING_ORDER_ERROR:", error)
            return undefined
        })

    if (exitingOrder) {
        redirect("/commerce/user/order")
    }

    const newOrder = await db
        .$transaction(async (transaction) => {
            await transaction.userState.update({
                where: {
                    userId: user.userId,
                },
                data: {
                    bookCart: [],
                },
            })

            const result = await transaction.order.create({
                data: {
                    userId: user.userId,
                    sessionId,
                },
            })

            return result
        })
        .catch((error) => {
            console.error("ERROR_WHEN_TRYING_TO_CREATE_ORDER:", error)
            return undefined
        })

    if (!newOrder) {
        return (
            <OrderFailedMessage
                sessionId={sessionId}
                message={"Erro ao tentar cadastrar o pedido."}
            ></OrderFailedMessage>
        )
    }

    redirect(`/commerce/user/order/${newOrder.id}`)
}

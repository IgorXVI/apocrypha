import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { db } from "~/server/db"

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        return <div>Não autorizado</div>
    }

    const existingOrder = await db.order
        .findFirst({
            where: {
                sessionId,
                userId: user.userId,
            },
        })
        .catch((error) => {
            console.error("FIND_DB_ORDER_ERROR", error)
            return null
        })

    if (!existingOrder) {
        return <p>Pedido não encontrado. Tente procurar no seu histórico de pedidos mais tarde.</p>
    }

    return (
        <div className="py-32 flex flex-col items-center space-y-6">
            <p className="text-2xl text-center font-bold text-green-500">O pagamento foi realizado com sucesso!</p>
            <Link
                href={`/commerce/user-order/${existingOrder.id}`}
                className="text-blue-500 text-center"
            >
                Ver pedido
            </Link>
            <Link
                href="/commerce"
                className="text-blue-500 text-center"
            >
                Continuar comprando
            </Link>
        </div>
    )
}

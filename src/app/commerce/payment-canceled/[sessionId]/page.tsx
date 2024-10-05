import Link from "next/link"
import { db } from "~/server/db"

export default async function PaymentCanceled({ params: { sessionId } }: { params: { sessionId: string } }) {
    await db.orderShipping.delete({
        where: {
            sessionId,
        },
    })

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

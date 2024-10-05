import Link from "next/link"
import { stripe } from "~/server/stripe-api"

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const shippingCost = (session.shipping_cost?.amount_total ?? 0) / 100

    const productsCost = (session.amount_total ?? 0) / 100

    return (
        <div className="py-32 flex flex-col items-center space-y-6">
            <p className="text-2xl text-center font-bold text-green-500">O pagamento foi realizado com sucesso!</p>
            <p>Frete: R$ {shippingCost.toFixed(2)}</p>
            <p>Preço dos produtos: R$ {productsCost.toFixed(2)}</p>
            <Link
                href="/commerce"
                className="text-blue-500 text-center"
            >
                Continuar comprando
            </Link>
        </div>
    )
}

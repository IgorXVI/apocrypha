import Link from "next/link"
import { type SuperFreteShipping } from "~/lib/types"
import { db } from "~/server/db"
import { stripe } from "~/server/stripe-api"

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const productsCost = (session.amount_total ?? 0) / 100

    const orderShippingData = await db.orderShipping.findUnique({
        where: {
            sessionId,
        },
    })

    const shippingMehtodsJSONs = orderShippingData?.shippingMethods.map((el) => el?.valueOf()) as SuperFreteShipping[]

    const sessionShippingChoice = await stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "")

    const shippingMethodChoice = shippingMehtodsJSONs.find((sm) => sm.id.toString() === sessionShippingChoice.metadata.serviceId)

    return (
        <div className="py-32 flex flex-col items-center space-y-6">
            <p className="text-2xl text-center font-bold text-green-500">O pagamento foi realizado com sucesso!</p>
            <p>Custo total: R$ {productsCost.toFixed(2)}</p>
            <p>Metodo de entrega: {shippingMethodChoice?.name}</p>
            <p>
                Tempo estimado: Entre {shippingMethodChoice?.delivery_range.min} e {shippingMethodChoice?.delivery_range.max} dias úteis
            </p>
            <section>
                <h3>Pacote:</h3>
                {shippingMethodChoice?.packages.map((pk, index) => (
                    <article key={index}>
                        <p>Dimenções: {`${pk.dimensions.height}cm x ${pk.dimensions.width}cm x ${pk.dimensions.length}cm`}</p>
                        <p>Formato: {pk.format}</p>
                        <p>Peso: {pk.weight}kg</p>
                    </article>
                ))}
            </section>
            <Link
                href="/commerce"
                className="text-blue-500 text-center"
            >
                Continuar comprando
            </Link>
        </div>
    )
}

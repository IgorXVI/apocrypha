import { auth, clerkClient } from "@clerk/nextjs/server"
import Link from "next/link"
import { env } from "~/env"
import { type SuperFreteShippingProduct, type SuperFreteShipping } from "~/lib/types"
import { db } from "~/server/db"
import { stripe } from "~/server/stripe-api"

const cClient = clerkClient()

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        const productsCost = (session.amount_total ?? 0) / 100

        const orderShippingData = await db.orderShipping.findUnique({
            where: {
                sessionId,
            },
        })

        const shippingMehtodsJSONs = orderShippingData?.shippingMethods.map((el) => el?.valueOf()) as SuperFreteShipping[]
        const shippingProducts = orderShippingData?.products.map((el) => el?.valueOf()) as SuperFreteShippingProduct[]

        const sessionShippingChoice = await stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "")

        const shippingMethodChoice = shippingMehtodsJSONs.find((sm) => sm.id.toString() === sessionShippingChoice.metadata.serviceId)

        const user = auth()

        if (!user.userId) {
            return <div>Não autorizado</div>
        }

        const userAddress = await db.address.findUnique({
            where: {
                userId: user.userId,
            },
        })

        const userData = await cClient.users.getUser(user.userId)

        const superFreteTicketReqBody = {
            from: {
                name: env.COMPANY_NAME_FOR_ADDRESS,
                address: env.COMPANY_STREET,
                district: env.COMPANY_NEIGHBORHOOD,
                state_abbr: env.COMPANY_STATE,
                postal_code: env.COMPANY_CEP,
                city: env.COMPANY_CITY,
            },
            to: {
                name: `${userData.firstName} ${userData.lastName}`,
                address: `${userAddress?.street}, número ${userAddress?.number}${userAddress?.complement ? `, ${userAddress?.complement}` : ""}`,
                district: userAddress?.neighborhood,
                city: userAddress?.city,
                state_abbr: userAddress?.state,
                postal_code: userAddress?.cep,
                email: userData.primaryEmailAddress?.emailAddress,
            },
            service: Number(sessionShippingChoice.metadata.serviceId),
            products: shippingProducts,
            volumes: { ...shippingMethodChoice?.packages[0].dimensions, weight: shippingMethodChoice?.packages[0].weight },
            tag: "Pedido de teste 1",
            url: env.URL,
            platform: env.APP_NAME,
            options: {
                insurance_value: null,
                non_commercial: false,
            },
        }

        const superFreteTicket = await fetch(`${env.SUPER_FRETE_URL}/cart`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.SUPER_FRETE_TOKEN}`,
                accept: "application/json",
                "User-Agent": env.APP_USER_AGENT,
                "content-type": "application/json",
            },
            body: JSON.stringify(superFreteTicketReqBody),
        }).then((response) => response.json())

        console.log(superFreteTicket)

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
    } catch (error) {
        console.log("SESSION_ID_CAUSED_ERROR", sessionId)
        console.error("SESSION_SUCCESS_ERROR", error)
        try {
            const sessionData = await stripe.checkout.sessions.retrieve(sessionId)
            await stripe.paymentIntents.cancel(sessionData.payment_intent?.toString() ?? "")
            return <p>Ocorreu um erro durante a conclusão do checkout, mas o seu dinheiro foi devolvido.</p>
        } catch (sessionCancelError) {
            console.error("SESSION_SUCCESS_CANCEL_ERROR", sessionCancelError)
            return (
                <p className="text-6xl text-red-500">
                    Ocorreu um erro durante a conclusão do checkout, O SEU DINHEIRO NÃO FOI DEVOLVIDO, CONTATE O SUPORTE POR EMAIL:{" "}
                    {env.APP_USER_AGENT}.
                </p>
            )
        }
    }
}

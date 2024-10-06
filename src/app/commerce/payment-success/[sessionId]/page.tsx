import { auth, clerkClient } from "@clerk/nextjs/server"
import Link from "next/link"
import { env } from "~/env"
import { type SuperFreteShippingProduct, type SuperFreteShipping } from "~/lib/types"
import { db } from "~/server/db"
import { stripe } from "~/server/stripe-api"

const cClient = clerkClient()

function PaymentSuccessView({
    order,
}: {
    order: {
        id: string
    }
}) {
    return (
        <div className="py-32 flex flex-col items-center space-y-6">
            <p className="text-2xl text-center font-bold text-green-500">O pagamento foi realizado com sucesso!</p>
            <p>{JSON.stringify(order)}</p>
            <Link
                href={`/commerce/user-order/${order.id}`}
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

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    try {
        const user = auth()

        if (!user.userId) {
            return <div>Não autorizado</div>
        }

        const existingOrder = await db.order.findFirst({
            where: {
                sessionId,
                userId: user.userId,
            },
        })

        if (existingOrder) {
            return <PaymentSuccessView order={existingOrder}></PaymentSuccessView>
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.status === "expired") {
            return <p>Stripe session não é mais válida.</p>
        }

        const [sessionShippingChoice, userAddress, userData, orderShippingData] = await Promise.all([
            stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "").catch((error) => {
                console.error("SESSION_SUCCESS_SHIPPING_RATES_RETRIEVE_ERROR", error)
                return undefined
            }),
            db.address
                .findUnique({
                    where: {
                        userId: user.userId,
                    },
                })
                .catch((error) => {
                    console.error("SESSION_SUCCESS_DB_ADDRESS_FIND_ERROR", error)
                    return undefined
                }),
            cClient.users.getUser(user.userId).catch((error) => {
                console.error("SESSION_SUCCESS_CLERK_GET_USER_ERROR", error)
                return undefined
            }),
            db.orderShipping
                .findUnique({
                    where: {
                        sessionId,
                    },
                })
                .catch((error) => {
                    console.error("SESSION_SUCCESS_DB_ORDER_SHIPPING_FIND_ERROR", error)
                    return undefined
                }),
        ])

        const shippingMehtodsJSONs = orderShippingData?.shippingMethods.map((el) => el?.valueOf()) as SuperFreteShipping[]
        const shippingProducts = orderShippingData?.products.map((el) => el?.valueOf()) as SuperFreteShippingProduct[]

        const shippingMethodChoice = shippingMehtodsJSONs.find((sm) => sm.id.toString() === sessionShippingChoice!.metadata.serviceId)

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
                name: `${userData!.firstName} ${userData!.lastName}`,
                address: `${userAddress?.street}, número ${userAddress?.number}${userAddress?.complement ? `, ${userAddress?.complement}` : ""}`,
                district: userAddress?.neighborhood,
                city: userAddress?.city,
                state_abbr: userAddress?.state,
                postal_code: userAddress?.cep,
                email: userData!.primaryEmailAddress?.emailAddress,
            },
            service: Number(sessionShippingChoice!.metadata.serviceId),
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

        const order = await db.order.create({
            data: {
                userId: user.userId,
                sessionId: sessionId,
                ticketId: superFreteTicket.id,
                totalPrice: session.amount_total! / 100,
                shippingPrice: shippingMethodChoice!.price,
                shippingServiceId: shippingMethodChoice!.id.toString(),
                shippingServiceName: shippingMethodChoice!.name,
                shippingDaysMin: shippingMethodChoice!.delivery_range.min,
                shippingDaysMax: shippingMethodChoice!.delivery_range.max,
                BookOnOrder: {
                    createMany: {
                        data: shippingProducts.map((sp) => ({
                            bookId: sp.bookDBId,
                            price: sp.unitary_value,
                        })),
                    },
                },
            },
        })

        return <PaymentSuccessView order={order}></PaymentSuccessView>
    } catch (error) {
        console.error("SESSION_SUCCESS_SESSION_ID_CAUSED_ERROR", sessionId)
        console.error("SESSION_SUCCESS_ERROR", error)
        try {
            const sessionData = await stripe.checkout.sessions.retrieve(sessionId)
            const refund = await stripe.refunds.create({
                amount: sessionData.amount_total ?? 0,
                reason: "requested_by_customer",
                reverse_transfer: true,
                refund_application_fee: true,
                payment_intent: sessionData.payment_intent?.toString(),
            })
            return (
                <div className="container mx-auto grid place-content-center">
                    <p className="text-2xl">
                        Ocorreu um erro durante a conclusão do checkout, mas o seu dinheiro foi devolvido. Qualquer dúvida contate o suporte por email{" "}
                        {env.APP_SUPPORT_EMAIL}. Refund status: {refund.status}
                    </p>
                </div>
            )
        } catch (sessionCancelError) {
            console.error("SESSION_SUCCESS_CANCEL_ERROR", sessionCancelError)
            return (
                <div className="container mx-auto grid place-content-center">
                    <p className="text-4xl text-red-500 font-extrabold">
                        Ocorreu um erro durante a conclusão do checkout, O SEU DINHEIRO NÃO FOI DEVOLVIDO, CONTATE O SUPORTE POR EMAIL:{" "}
                        {env.APP_SUPPORT_EMAIL}. CHECKOUT_SESSION_ID: {sessionId}
                    </p>
                </div>
            )
        }
    }
}

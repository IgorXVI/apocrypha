import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { env } from "~/env"
import { authClient } from "~/server/auth-api"
import { db } from "~/server/db"
import { type CreateShippingTicketProduct, type CalcShippingFeePackage, createShippingTicket } from "~/server/shipping-api"
import { type ShippingPackageData, stripe } from "~/server/stripe-api"

function PaymentFailedMessage({ sessionId, message }: { sessionId: string; message: string }) {
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
    try {
        const user = auth()

        if (!user.userId) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Não autorizado."
                ></PaymentFailedMessage>
            )
        }

        const exitingOrder = await db.order.findFirst({
            where: {
                sessionId,
            },
            select: {
                id: true,
            },
        })

        if (exitingOrder) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Pedido ja está cadastrado."
                ></PaymentFailedMessage>
            )
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (!session || session.status !== "complete" || !session.payment_intent) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Stripe session não está completa."
                ></PaymentFailedMessage>
            )
        }

        const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id

        const stripeShipping = await stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "").catch((error) => {
            console.error("SESSION_SUCCESS_SHIPPING_RATES_RETRIEVE_ERROR", error)
            return undefined
        })

        if (!stripeShipping) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Não foram encontrados os dados de entrega no stripe."
                ></PaymentFailedMessage>
            )
        }

        const userAddress = await db.address.findUnique({
            where: {
                userId: user.userId,
            },
        })

        if (!userAddress) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Usuário não possui os dados de endereço."
                ></PaymentFailedMessage>
            )
        }

        const checkoutSessionStore = await db.checkoutSessionStore.findUnique({
            where: {
                sessionId,
            },
        })

        if (!checkoutSessionStore) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Dados dos produtos comprados não foram encontrados."
                ></PaymentFailedMessage>
            )
        }

        const productsForTicket: CreateShippingTicketProduct[] = checkoutSessionStore.products.map((p) => p?.valueOf() as CreateShippingTicketProduct)

        const allShippingPackages: ShippingPackageData[] = checkoutSessionStore.shippingPackages.map((sp) => sp?.valueOf() as ShippingPackageData)
        const shippingPackages: CalcShippingFeePackage[] =
            allShippingPackages.find((sp) => sp.id === (stripeShipping.metadata.serviceId ?? ""))?.packages ?? []

        const fristPackage = shippingPackages[0]

        if (!fristPackage) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Dados de tamanho do pacote não foram encotrados no stripe."
                ></PaymentFailedMessage>
            )
        }

        const userData = await authClient.users.getUser(user.userId)

        const ticketRes = await createShippingTicket({
            to: {
                name: `${userData.firstName} ${userData.lastName}`,
                address: `${userAddress.street}, número ${userAddress.number}${userAddress.complement ? `, ${userAddress.complement}` : ""}`,
                district: userAddress.neighborhood,
                city: userAddress.city,
                state_abbr: userAddress.state,
                postal_code: userAddress.cep,
                email: userData.primaryEmailAddress?.emailAddress ?? "N/A",
            },
            service: Number(stripeShipping.metadata.serviceId) ?? 0,
            products: productsForTicket,
            volumes: {
                weight: fristPackage.weight,
                height: fristPackage.dimensions.height,
                length: fristPackage.dimensions.length,
                width: fristPackage.dimensions.width,
            },
            tag: JSON.stringify({ sessionId: session.id, userId: user.userId }),
        })

        await db.order.create({
            data: {
                userId: user.userId,
                sessionId: session.id,
                paymentId,
                ticketId: ticketRes.id,
                totalPrice: session.amount_total! / 100,
                shippingPrice: session.shipping_cost!.amount_total / 100,
                shippingServiceId: stripeShipping.metadata.serviceId!,
                shippingServiceName: stripeShipping.display_name!,
                shippingDaysMin: stripeShipping.delivery_estimate!.minimum!.value,
                shippingDaysMax: stripeShipping.delivery_estimate!.maximum!.value,
                BookOnOrder: {
                    createMany: {
                        data: productsForTicket.map((p) => ({
                            bookId: p.bookDBId,
                            price: p.unitary_value,
                            amount: p.quantity,
                        })),
                    },
                },
            },
        })

        await db.checkoutSessionStore.delete({
            where: {
                sessionId,
            },
        })
    } catch (error) {
        return (
            <PaymentFailedMessage
                sessionId={sessionId}
                message={`${error instanceof Error ? error.message : JSON.stringify(error)}`}
            ></PaymentFailedMessage>
        )
    }

    redirect("/commerce/user/order")
}

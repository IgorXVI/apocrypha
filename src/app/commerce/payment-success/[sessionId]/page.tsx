import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { authClient } from "~/server/auth-api"
import { db } from "~/server/db"
import { type CreateShippingTicketProduct, type CalcShippingFeePackage, createShippingTicket } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    const user = auth()

    if (!user.userId) {
        redirect("/commerce")
    }

    const exitingOrder = await db.order.findUnique({
        where: {
            sessionId,
        },
        select: {
            id: true,
        },
    })

    if (exitingOrder) {
        redirect("/commerce")
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.status !== "complete" || !session.payment_intent) {
        redirect("/commerce")
    }

    const stripeShipping = await stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "").catch((error) => {
        console.error("SESSION_SUCCESS_SHIPPING_RATES_RETRIEVE_ERROR", error)
        return undefined
    })

    if (!stripeShipping) {
        redirect("/commerce")
    }

    const userAddress = await db.address.findUnique({
        where: {
            userId: user.userId,
        },
    })

    if (!userAddress) {
        redirect("/commerce")
    }

    const productsForTicket: CreateShippingTicketProduct[] = JSON.parse(session.metadata?.productsForTicketJSON ?? "[]")
    const shippingPackages: CalcShippingFeePackage[] = JSON.parse(stripeShipping.metadata.serviceId ?? "[]")

    const fristPackage = shippingPackages[0]

    if (!fristPackage) {
        redirect("/commerce")
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
            paymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id,
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
                    })),
                },
            },
        },
    })

    redirect("/commerce/user/order")
}

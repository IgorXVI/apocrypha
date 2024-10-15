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
            <p>Salve o(s) ID(s) e entre em contato com o suporte por email: {env.APP_USER_AGENT}</p>
        </div>
    )
}

export default async function PaymentSuccess({ params: { sessionId } }: { params: { sessionId: string } }) {
    let globalPaymentId: string | undefined
    try {
        const user = auth()

        if (!user.userId) {
            throw new Error("Unauthorized")
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
            throw new Error("Order already exists")
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (!session || session.status !== "complete" || !session.payment_intent) {
            throw new Error("Stripe session not completed")
        }

        const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id
        globalPaymentId = paymentId

        const stripeShipping = await stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "").catch((error) => {
            console.error("SESSION_SUCCESS_SHIPPING_RATES_RETRIEVE_ERROR", error)
            return undefined
        })

        if (!stripeShipping) {
            throw new Error("Shipping data nout found")
        }

        const userAddress = await db.address.findUnique({
            where: {
                userId: user.userId,
            },
        })

        if (!userAddress) {
            throw new Error("User address data nout found")
        }

        const checkoutSessionStore = await db.checkoutSessionStore.findUnique({
            where: {
                sessionId,
            },
        })

        if (!checkoutSessionStore) {
            throw new Error("Product data nout found")
        }

        const productsForTicket: CreateShippingTicketProduct[] = checkoutSessionStore.products.map((p) => p?.valueOf() as CreateShippingTicketProduct)

        const allShippingPackages: ShippingPackageData[] = checkoutSessionStore.shippingPackages.map((sp) => sp?.valueOf() as ShippingPackageData)
        const shippingPackages: CalcShippingFeePackage[] =
            allShippingPackages.find((sp) => sp.id === (stripeShipping.metadata.serviceId ?? ""))?.packages ?? []

        const fristPackage = shippingPackages[0]

        if (!fristPackage) {
            throw new Error("Shipping package size data nout found")
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

        await db.$transaction(async (transaction) => {
            const books = await transaction.book.findMany({
                where: {
                    id: {
                        in: productsForTicket.map((p) => p.bookDBId),
                    },
                },
                select: {
                    id: true,
                    stock: true,
                },
            })

            const updateManyBooks: {
                data: {
                    stock: number
                }
                where: {
                    id: string
                }
            }[] = []

            productsForTicket.forEach((p) => {
                const book = books.find((b) => b.id === p.bookDBId)

                if (!book || book.stock < p.quantity) {
                    throw new Error(`Book "${p.name}" is out of stock.`)
                }

                updateManyBooks.push({
                    data: {
                        stock: book.stock - p.quantity,
                    },
                    where: {
                        id: book.id,
                    },
                })
            })

            const updateResults = await Promise.allSettled(updateManyBooks.map((u) => transaction.book.update(u)))

            updateResults.forEach((ur) => {
                if (ur.status === "rejected") {
                    throw ur.reason
                }
            })

            await transaction.order.create({
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

            await transaction.checkoutSessionStore.delete({
                where: {
                    sessionId,
                },
            })
        })
    } catch (error) {
        const getErrorStr = (e: unknown) => (e instanceof Error ? e.message : JSON.stringify(e || "NULL"))

        console.error("PAYMENT_SUCCESS_ERROR:", getErrorStr(error))

        if (!globalPaymentId) {
            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message="Um erro inesperado acontecer ao tentar concluir a compra."
                ></PaymentFailedMessage>
            )
        }

        try {
            let refund = await stripe.refunds
                .list({
                    payment_intent: globalPaymentId,
                })
                .then((res) => res.data[0])

            if (!refund) {
                refund = await stripe.refunds.create({
                    payment_intent: globalPaymentId,
                })
            }

            if (refund.status !== "succeeded" && refund.status !== "pending") {
                return (
                    <PaymentFailedMessage
                        sessionId={sessionId}
                        message={`Erro ao tentar fazer reembolso no Stripe, retornou status: ${refund.status}, ID do pagamento: ${globalPaymentId}`}
                    ></PaymentFailedMessage>
                )
            }

            return (
                <div className="text-lg flex flex-col justify-center items-center min-h-[50vh]">
                    <p className="text-3xl mb-10">
                        Um erro aconteceu, porém o <span className="text-green-500">seu dinheiro foi devolvido</span>
                    </p>
                    <p>Status do reembolso no Stripe: {refund.status}</p>
                    <p>ID do pagamento: {globalPaymentId}</p>
                    <p>Se tiver alguma dúvida, salve o ID e entre em contato com o suporte por email: {env.APP_USER_AGENT}</p>
                </div>
            )
        } catch (stripeError) {
            console.error("STRIPE_REFUND_ERROR:", stripeError)

            return (
                <PaymentFailedMessage
                    sessionId={sessionId}
                    message={`Um erro inesperado aconteceu durante criação do reembolso no Stripe, ID do pagamento: ${globalPaymentId}`}
                ></PaymentFailedMessage>
            )
        }
    }

    redirect("/commerce/user/order")
}

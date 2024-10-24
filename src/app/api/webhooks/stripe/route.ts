import { env } from "~/env"
import { db } from "~/server/db"
import { handleChekoutConfirmation, stripe } from "~/server/stripe-api"

export async function POST(req: Request) {
    try {
        const signature = req.headers.get("stripe-signature") ?? ""

        const body = await req.text()

        const stripeEvent = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)

        if (
            stripeEvent.type !== "checkout.session.completed" &&
            stripeEvent.type !== "checkout.session.async_payment_succeeded" &&
            stripeEvent.type !== "checkout.session.async_payment_failed" &&
            stripeEvent.type !== "checkout.session.expired"
        ) {
            return Response.json(
                {
                    success: false,
                    errorMessage: `Event is of the wrong type: ${stripeEvent.type}`,
                },
                {
                    status: 400,
                },
            )
        }

        const session = stripeEvent.data.object

        if (stripeEvent.type === "checkout.session.async_payment_failed" || stripeEvent.type === "checkout.session.expired") {
            const cancelResult = await db.order
                .update({
                    where: {
                        sessionId: session.id,
                    },
                    data: {
                        status: "CANCELED",
                        cancelReason: "EXCEPTION",
                        cancelMessage: `Stripe event: ${stripeEvent.type}`,
                        updatedAt: new Date(),
                    },
                })
                .catch((error) => {
                    console.error("PAYMENT_CANCELED_DELETE_ORDER_ERROR:", error)
                    return undefined
                })

            if (!cancelResult) {
                return Response.json(
                    {
                        success: false,
                        errorMessage: `Order cancel failed.`,
                    },
                    {
                        status: 400,
                    },
                )
            }

            return Response.json({
                success: true,
                orderCaceled: cancelResult.id,
            })
        }

        const confirmationResult = await handleChekoutConfirmation(session)

        if (!confirmationResult.success) {
            return Response.json(confirmationResult, {
                status: 400,
            })
        }

        return Response.json({
            success: true,
        })
    } catch (error) {
        console.error("STRIPE_WEBHOOK_ERROR:", error)

        return Response.json(
            {
                success: false,
                errorMessage: "Error during the execution of the Stripe Webhook.",
            },
            {
                status: 400,
            },
        )
    }
}

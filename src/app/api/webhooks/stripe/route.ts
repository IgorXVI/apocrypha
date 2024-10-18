import { handleChekoutConfirmation, stripe } from "~/server/stripe-api"

const endpointSecret = "whsec_..."

export async function POST(req: Request) {
    try {
        const signature = req.headers.get("stripe-signature") ?? ""

        const body = await req.text()

        const stripeEvent = stripe.webhooks.constructEvent(body, signature, endpointSecret)

        if (stripeEvent.type !== "checkout.session.completed") {
            throw new Error(`Event is of the wrong type: ${stripeEvent.type}`)
        }

        const session = stripeEvent.data.object

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

import { z } from "zod"
import { createCheckoutSession } from "~/server/stripe-api"

const checkoutValidationSchema = z.object({
    products: z.array(
        z.object({
            stripeId: z.string(),
            quantity: z.number().int().positive(),
        }),
    ),
})

type CheckoutDataInput = z.infer<typeof checkoutValidationSchema>

export type POSTApiCheckoutInput = {
    data: CheckoutDataInput
}

export type POSTApiCheckoutOutput =
    | {
          success: true
          url: string
      }
    | {
          success: false
          errorMessage: string
          issues?: z.ZodIssue[]
      }

export async function POST(req: Request) {
    const reqBodyResult = await req
        .json()
        .then((data) => {
            return {
                success: true,
                data,
                errorMessage: "",
            }
        })
        .catch((error) => {
            return {
                success: false,
                data: undefined,
                errorMessage: (error as Error).message,
            }
        })

    if (!reqBodyResult.success) {
        return Response.json(
            {
                success: false,
                errorMessage: reqBodyResult.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    const validationResult = checkoutValidationSchema.safeParse(reqBodyResult.data)

    if (!validationResult.success) {
        return Response.json(
            {
                success: false,
                errorMessage: validationResult.error.issues[0]?.message ?? "Validation failed",
                issues: validationResult.error.issues,
            },
            {
                status: 400,
            },
        )
    }

    const result = await createCheckoutSession(validationResult.data.products)

    if (!result.success) {
        return Response.json(
            {
                success: false,
                errorMessage: result.message,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json({
        success: true,
        url: result.url,
    })
}

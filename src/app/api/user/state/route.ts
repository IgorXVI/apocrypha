import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

import { db } from "~/server/db"
import { errorHandler } from "~/server/generic-queries"

export const dynamic = "force-dynamic"

const userStateValidationSchema = z.object({
    bookCart: z.array(
        z.object({
            id: z.string(),
            stock: z.number().nonnegative(),
            mainImg: z.string().url(),
            title: z.string(),
            author: z.string(),
            authorId: z.string(),
            price: z.number().positive(),
            amount: z.number().nonnegative(),
            stripeId: z.string(),
        }),
    ),
    bookFavs: z.array(
        z.object({
            id: z.string(),
            stock: z.number().nonnegative(),
            mainImg: z.string().url(),
            title: z.string(),
            author: z.string(),
            authorId: z.string(),
            price: z.number().positive(),
            amount: z.number().nonnegative(),
            stripeId: z.string(),
        }),
    ),
})

type UserStateSchema = z.infer<typeof userStateValidationSchema>

export type POSTApiUserStateInput = {
    data: UserStateSchema
}

export type POSTApiUserStateOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
          issues?: z.ZodIssue[]
      }

export async function POST(req: Request) {
    const user = auth()

    if (!user.userId) {
        return Response.json(
            {
                success: false,
                errorMessage: "Unauthorized",
            },
            {
                status: 401,
            },
        )
    }

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

    const validationResult = userStateValidationSchema.safeParse(reqBodyResult.data)

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

    const requestData = reqBodyResult.data as UserStateSchema

    const result = await errorHandler(() =>
        db.userState.upsert({
            where: {
                userId: user.userId,
            },
            create: {
                userId: user.userId,
                ...requestData,
            },
            update: requestData,
        }),
    )

    if (!result.success) {
        return Response.json(
            {
                success: false,
                errorMessage: result.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json({
        success: true,
    })
}

export type GETApiUserStateOutput =
    | {
          success: true
          data: UserStateSchema | null
      }
    | {
          success: false
          errorMessage: string
      }

export async function GET() {
    const user = auth()

    if (!user.userId) {
        return Response.json(
            {
                success: false,
                errorMessage: "Unauthorized",
            },
            {
                status: 401,
            },
        )
    }

    const result = await errorHandler(() =>
        db.userState.findUnique({
            where: {
                userId: user.userId,
            },
        }),
    )

    if (!result.success) {
        return Response.json(
            {
                success: false,
                errorMessage: result.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json({
        success: true,
        data: result.data,
    })
}

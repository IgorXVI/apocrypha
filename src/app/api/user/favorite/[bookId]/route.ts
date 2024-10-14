import { auth } from "@clerk/nextjs/server"

import { db } from "~/server/db"
import { errorHandler } from "~/server/generic-queries"

export type GETApiFavoriteBookOutput =
    | {
          success: true
          isFav: boolean
      }
    | {
          success: false
          errorMessage: string
      }

export async function GET(_: Request, { params: { bookId } }: { params: { bookId: string } }) {
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
        db.favorite.findUnique({
            where: {
                userId_bookId: {
                    userId: user.userId,
                    bookId: bookId,
                },
            },
            select: {
                id: true,
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
        isFav: result.data?.id !== undefined,
    })
}

export type POSTApiFavoriteBookOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
      }

export async function POST(_: Request, { params: { bookId } }: { params: { bookId: string } }) {
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
        db.favorite.create({
            data: {
                userId: user.userId,
                bookId: bookId,
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
    })
}

export type DELETEApiFavoriteBookOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
      }

export async function DELETE(_: Request, { params: { bookId } }: { params: { bookId: string } }) {
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
        db.favorite.delete({
            where: {
                userId_bookId: {
                    bookId: bookId,
                    userId: user.userId,
                },
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
    })
}

"use server"

import { db } from "../db"
import { auth } from "@clerk/nextjs/server"
import { authClient } from "../auth-api"
import { reviewValidationSchema } from "~/lib/validation"

export const upsertReview = async (data: unknown) => {
    const user = auth()

    if (!user.userId) {
        return {
            success: false,
            errorMessage: "Não autorizado.",
        }
    }

    const userData = await authClient.users.getUser(user.userId).catch((error) => {
        console.error("GET_USER_DATA_ON_REVIEW_ERROR:", error)
        return undefined
    })

    if (!userData) {
        return {
            success: false,
            errorMessage: "Não foi possível encontrar os dados do usuário.",
        }
    }

    const validationResult = reviewValidationSchema.safeParse(data)

    if (!validationResult.success) {
        return {
            success: false,
            errorMessage: "Validação falhou.",
            issues: validationResult.error.issues,
        }
    }

    const validData = validationResult.data

    const upsertResult = await db.review
        .upsert({
            where: {
                userId_bookId: {
                    userId: user.userId,
                    bookId: validData.bookId,
                },
            },
            create: {
                ...validData,
                userId: user.userId,
                userName: userData.fullName ?? user.userId,
            },
            update: {
                ...validData,
                userName: userData.fullName ?? user.userId,
            },
        })
        .catch((error) => {
            console.error("UPSERT_REVIEW_ERROR:", error)
            return undefined
        })

    if (!upsertResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro durante a criação ou atualização da avaliação.",
        }
    }

    return {
        success: true,
    }
}

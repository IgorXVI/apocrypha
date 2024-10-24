"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "../db"
import { authClient } from "../auth-api"

export const createFeedback = async (formData: unknown) => {
    const user = auth()

    if (!user.userId) {
        return {
            success: false,
            errorMessage: "Não autorizado.",
        }
    }

    const userData = await authClient.users.getUser(user.userId).catch((error) => {
        console.error("GET_USER_ERROR", error)
        return undefined
    })

    if (!userData) {
        return {
            success: false,
            errorMessage: "Não foi possível buscar os dados de usuário.",
        }
    }

    if (!(formData instanceof FormData)) {
        return {
            success: false,
            errorMessage: "O input deve ser FormData.",
        }
    }

    const message = formData.get("message")?.toString()
    const type = formData.get("type")?.toString()

    if (!message) {
        return {
            success: false,
            errorMessage: "Mensagem deve ser enviada.",
        }
    }

    if (message.length > 200) {
        return {
            success: false,
            errorMessage: "Mensagem só pode ter até 200 caracteres.",
        }
    }

    if (!type) {
        return {
            success: false,
            errorMessage: "Tipo da mensagem deve ser escolhido.",
        }
    }

    if (type !== "BUG" && type !== "ORDER" && type !== "MISC") {
        return {
            success: false,
            errorMessage: "O tipo da mesnagem é inválido.",
        }
    }

    const userFeedBackCount = await db.feedback.count({
        where: {
            userId: user.userId,
        },
    })

    if (userFeedBackCount > 300) {
        return {
            success: false,
            errorMessage: "Só é possível mandar até 300 feedbacks.",
        }
    }

    const result = await db.feedback
        .create({
            data: {
                message,
                type,
                userId: user.userId,
                userEmail: userData.primaryEmailAddress?.emailAddress,
                userName: userData.fullName,
            },
        })
        .catch((error) => {
            console.error("CREATE_FEEDBACK_ERROR", error)
            return undefined
        })

    if (!result) {
        return {
            success: false,
            errorMessage: "Não foi possível cadastrar os dados.",
        }
    }

    return {
        success: true,
    }
}

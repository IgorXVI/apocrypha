"use server"

import { db } from "../db"
import { updateProduct } from "../stripe-api"

export const updateStock = async (id: unknown, newStock: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "O valor de id deve ser uma string.",
        }
    }

    if (Number.isNaN(newStock) || typeof newStock !== "number" || (typeof newStock === "number" && newStock < 0)) {
        return {
            success: false,
            errorMessage: "O valor do estoque deve ser zero ou um número positivo.",
        }
    }

    const updateResult = await db.book
        .update({
            where: {
                id,
            },
            data: {
                stock: newStock,
            },
        })
        .catch((error) => {
            console.error("BOOK_STOCK_UPDATE_ON_SERVER_ACTION_ERROR", error)
            return undefined
        })

    if (!updateResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro durante a atualização do estoque do livro.",
        }
    }

    return {
        success: true,
    }
}

export const updatePrice = async (id: unknown, newPrice: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "O valor de id deve ser uma string.",
        }
    }

    if (Number.isNaN(newPrice) || typeof newPrice !== "number" || (typeof newPrice === "number" && newPrice <= 10)) {
        return {
            success: false,
            errorMessage: "O valor do preço deve ser um número positivo, maior que 10.",
        }
    }

    const bookDBData = await db.book
        .findUnique({
            where: {
                id,
            },
            select: {
                stripeId: true,
            },
        })
        .catch((error) => {
            console.error("FIND_BOOK_ON_PRICE_UPDATE_ERROR", error)
            return undefined
        })

    if (!bookDBData) {
        return {
            success: false,
            errorMessage: "Erro ao tentar buscar dados do livro.",
        }
    }

    const stripeResponse = await updateProduct(bookDBData.stripeId, {
        price: newPrice,
    })

    if (!stripeResponse.success) {
        return {
            success: false,
            errorMessage: stripeResponse.message,
        }
    }

    const updateResult = await db.book
        .update({
            where: {
                id,
            },
            data: {
                price: newPrice,
            },
        })
        .catch((error) => {
            console.error("BOOK_STOCK_UPDATE_ON_SERVER_ACTION_ERROR", error)
            return undefined
        })

    if (!updateResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro durante a atualização do estoque do livro.",
        }
    }

    return {
        success: true,
    }
}

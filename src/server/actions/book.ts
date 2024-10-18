"use server"

import { db } from "../db"

export const updateStock = async (id: unknown, newStock: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "O valor de id deve ser uma string.",
        }
    }

    if (typeof newStock !== "number" || (typeof newStock === "number" && newStock < 0)) {
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

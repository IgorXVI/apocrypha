"use server"

import { revalidatePath } from "next/cache"
import { setTimeout } from "timers/promises"
import { db } from "./db"

export const createCurrency = async (data: {
    label: string
    iso4217Code: string
}) => {
    try {
        await setTimeout(3000)

        await db.currency.create({
            data,
        })

        revalidatePath("/admin/currency")

        return {
            success: true,
            errorMessage: "",
            data: undefined,
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            errorMessage: (e as Error).message,
            data: undefined,
        }
    }
}

export const updateCurrency = async (
    id: string,
    data: {
        label: string
        iso4217Code: string
    },
) => {
    try {
        await setTimeout(3000)

        await db.currency.update({
            data,
            where: {
                id,
            },
        })

        revalidatePath("/admin/currency")

        return {
            success: true,
            errorMessage: "",
            data: undefined,
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            errorMessage: (e as Error).message,
            data: undefined,
        }
    }
}

export const deleteCurrency = async (id: string) => {
    try {
        await db.currency.delete({
            where: {
                id,
            },
        })

        revalidatePath("/admin/currency")

        return {
            success: true,
            errorMessage: "",
            data: undefined,
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            errorMessage: (e as Error).message,
            data: undefined,
        }
    }
}

export const getOneCurrency = async (id: string) => {
    try {
        const currency = await db.currency.findUnique({
            where: {
                id,
            },
        })

        if (!currency) {
            return {
                success: false,
                errorMessage: "Currency not found",
                data: undefined,
            }
        }

        return {
            success: true,
            errorMessage: "",
            data: currency,
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            errorMessage: (e as Error).message,
            data: undefined,
        }
    }
}

export const getAllCurrencies = async () => {
    try {
        const currencies = await db.currency.findMany()

        return {
            success: true,
            errorMessage: "",
            currencies,
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            errorMessage: (e as Error).message,
            currencies: [],
        }
    }
}

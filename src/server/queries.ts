"use server"

import { revalidatePath } from "next/cache"
import { db } from "./db"

export const createCurrency = async (data: {
    label: string
    iso4217Code: string
}) => {
    try {
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

export const getManyCurrencies = async ({
    take,
    skip,
}: {
    take: number
    skip: number
}) => {
    try {
        const [currenciesResult, totalResult] = await Promise.allSettled([
            db.currency.findMany({
                take,
                skip,
            }),
            db.currency.count(),
        ])

        if (currenciesResult.status === "rejected") {
            console.error(currenciesResult.reason)
            return {
                success: false,
                errorMessage: (currenciesResult.reason as Error).message,
                data: undefined,
            }
        }

        if (totalResult.status === "rejected") {
            console.error(totalResult.reason)
            return {
                success: false,
                errorMessage: (totalResult.reason as Error).message,
                data: undefined,
            }
        }

        const total = totalResult.value
        const currencies = currenciesResult.value

        return {
            success: true,
            errorMessage: "",
            data: {
                total,
                currencies,
            },
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

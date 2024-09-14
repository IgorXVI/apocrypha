"use server"

import { db } from "./db"

export const createCurrency = async (data: {
    label: string
    iso4217Code: string
}) => {
    try {
        await db.currency.create({
            data,
        })
        return {
            success: true,
            errorMessage: "",
        }
    } catch (e) {
        console.error(e)
        return {
            success: false,
            errorMessage: (e as Error).message,
        }
    }
}

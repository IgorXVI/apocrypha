"use server"

import { type Prisma } from "prisma/prisma-client"
import { type DefaultArgs } from "@prisma/client/runtime/library"
import { revalidatePath } from "next/cache"

import { db } from "./db"

export type CommonDBReturn<T> = {
    success: boolean
    errorMessage: string
    data: T | undefined
}

type AnyModel = Prisma.PublisherDelegate<DefaultArgs>

async function errorHandler<T>(
    fun: () => Promise<T>,
): Promise<CommonDBReturn<T>> {
    try {
        const result = await fun()

        return {
            success: true,
            errorMessage: "",
            data: result,
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

export const createCurrency = (data: { label: string; iso4217Code: string }) =>
    errorHandler(async () => {
        await db.currency.create({
            data,
        })

        revalidatePath("/admin/currency")

        return undefined
    })

export const updateCurrency = (
    id: string,
    data: {
        label: string
        iso4217Code: string
    },
) =>
    errorHandler(async () => {
        await db.currency.update({
            data,
            where: {
                id,
            },
        })

        revalidatePath("/admin/currency")

        return undefined
    })

export const deleteCurrency = (id: string) =>
    errorHandler(async () => {
        await db.currency.delete({
            where: {
                id,
            },
        })

        revalidatePath("/admin/currency")

        return undefined
    })

export const getOneCurrency = async (id: string) =>
    errorHandler(async () => {
        const currency = await db.currency.findUnique({
            where: {
                id,
            },
        })

        if (!currency) {
            throw new Error("Currency not found")
        }

        return currency
    })

export const getMany =
    <T>({ attrs, model }: { attrs: string[]; model: AnyModel }) =>
    async ({
        take,
        skip,
        searchTerm,
    }: {
        take: number
        skip: number
        searchTerm: string
    }) =>
        errorHandler(async () => {
            const whereClause = {
                OR: attrs.reduce(
                    (prev, attr) =>
                        prev.concat([
                            {
                                [attr]: {
                                    startsWith: searchTerm,
                                },
                            },
                            {
                                [attr]: {
                                    endsWith: searchTerm,
                                },
                            },
                        ]),
                    [] as Record<string, Record<string, string>>[],
                ),
            }

            const [rowsResult, totalResult] = await Promise.allSettled([
                model.findMany({
                    take,
                    skip,
                    where: whereClause,
                }),
                model.count({
                    where: whereClause,
                }),
            ])

            if (rowsResult.status === "rejected") {
                throw rowsResult.reason
            }

            if (totalResult.status === "rejected") {
                throw totalResult.reason
            }

            const total = totalResult.value
            const rows = rowsResult.value as T[]

            return {
                total,
                rows,
            }
        })

export const getManyCurrencies = getMany<
    Prisma.CurrencyGetPayload<Prisma.CurrencyDefaultArgs>
>({
    attrs: ["label", "iso4217Code"] as Prisma.CurrencyScalarFieldEnum[],
    model: db.currency as unknown as AnyModel,
})

export const getManyTranslators = getMany<
    Prisma.TranslatorGetPayload<Prisma.TranslatorDefaultArgs>
>({
    attrs: ["name"] as Prisma.TranslatorScalarFieldEnum[],
    model: db.translator as unknown as AnyModel,
})

export const getManyPublishers = getMany<
    Prisma.PublisherGetPayload<Prisma.PublisherDefaultArgs>
>({
    attrs: ["name"] as Prisma.PublisherScalarFieldEnum[],
    model: db.publisher as unknown as AnyModel,
})

export const getManyLanguages = getMany<
    Prisma.LanguageGetPayload<Prisma.LanguageDefaultArgs>
>({
    attrs: [
        "name",
        "iso6391Code",
        "iso6392Code",
    ] as Prisma.LanguageScalarFieldEnum[],
    model: db.language as unknown as AnyModel,
})

export const getManyCategories = getMany<
    Prisma.CategoryGetPayload<Prisma.CategoryDefaultArgs>
>({
    attrs: ["name"] as Prisma.CategoryScalarFieldEnum[],
    model: db.category as unknown as AnyModel,
})

export const getManyAuthors = getMany<
    Prisma.AuthorGetPayload<Prisma.AuthorDefaultArgs>
>({
    attrs: ["name", "about"] as Prisma.AuthorScalarFieldEnum[],
    model: db.author as unknown as AnyModel,
})

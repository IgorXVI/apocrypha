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

const createOne =
    <T>(model: AnyModel, slug: string) =>
    (data: T) =>
        errorHandler(async () => {
            await model.create({
                data: data as unknown as Prisma.PublisherCreateInput,
            })

            revalidatePath(`/admin/${slug}`)

            return undefined
        })

const updateOne =
    <T>(model: AnyModel, slug: string) =>
    (id: string, data: T) =>
        errorHandler(async () => {
            await model.update({
                data: data as unknown as Prisma.PublisherUpdateInput,
                where: {
                    id,
                },
            })

            revalidatePath(`/admin/${slug}`)

            return undefined
        })

const deleteOne = (model: AnyModel, slug: string) => (id: string) =>
    errorHandler(async () => {
        await model.delete({
            where: {
                id,
            },
        })

        revalidatePath(`/admin/${slug}`)

        return undefined
    })

const getOne =
    <T>(model: AnyModel) =>
    async (id: string) =>
        errorHandler(async () => {
            const row = await model.findUnique({
                where: {
                    id,
                },
            })

            if (!row) {
                throw new Error("Not found")
            }

            return row as T
        })

const getMany =
    <T>({ attrs, model }: { attrs: string[]; model: AnyModel }) =>
    async (input: { take: number; skip: number; searchTerm: string }) =>
        errorHandler(async () => {
            const whereClause = {
                OR: attrs.reduce(
                    (prev, attr) =>
                        prev.concat([
                            {
                                [attr]: {
                                    startsWith: input.searchTerm,
                                },
                            },
                            {
                                [attr]: {
                                    endsWith: input.searchTerm,
                                },
                            },
                        ]),
                    [] as Record<string, Record<string, string>>[],
                ),
            }

            const [rowsResult, totalResult] = await Promise.allSettled([
                model.findMany({
                    take: input.take,
                    skip: input.skip,
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

type SearchCurrencyPayload =
    Prisma.CurrencyGetPayload<Prisma.CurrencyDefaultArgs>

const currencyAnyModel = db.currency as unknown as AnyModel

const currencySlug = "currency"

export const getManyCurrencies = getMany<SearchCurrencyPayload>({
    attrs: ["label", "iso4217Code"] as Prisma.CurrencyScalarFieldEnum[],
    model: currencyAnyModel,
})

export const getOneCurrency = getOne<SearchCurrencyPayload>(currencyAnyModel)

export const createCurrency = createOne<Prisma.CurrencyCreateInput>(
    currencyAnyModel,
    currencySlug,
)

export const updateCurrency = updateOne<Prisma.CurrencyUpdateInput>(
    currencyAnyModel,
    currencySlug,
)

export const deleteCurrency = deleteOne(currencyAnyModel, currencySlug)

"use server"

import { type Prisma } from "prisma/prisma-client"
import { type DefaultArgs } from "@prisma/client/runtime/library"
import { revalidatePath } from "next/cache"

import { db } from "./db"

type CommonDBReturn<T> = {
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
    (id: string) =>
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
    (input: { take: number; skip: number; searchTerm: string }) =>
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

const createAdminQueries = <T, F extends string, C, U>(
    model: AnyModel,
    slug: string,
    searchAttrs: F[],
) => ({
    getMany: getMany<T>({
        attrs: searchAttrs,
        model,
    }),
    getOne: getOne<T>(model),
    createOne: createOne<C>(model, slug),
    updateOne: updateOne<U>(model, slug),
    deleteOne: deleteOne(model, slug),
})

const currencyAdminQueries = createAdminQueries<
    Prisma.CurrencyGetPayload<Prisma.CurrencyDefaultArgs>,
    Prisma.CurrencyScalarFieldEnum,
    Prisma.CurrencyCreateInput,
    Prisma.CurrencyUpdateInput
>(db.currency as unknown as AnyModel, "currency", ["iso4217Code", "label"])
export const currencyGetMany = currencyAdminQueries.getMany
export const currencyGetOne = currencyAdminQueries.getOne
export const currencyCreateOne = currencyAdminQueries.createOne
export const currencyUpdateOne = currencyAdminQueries.updateOne
export const currencyDeleteOne = currencyAdminQueries.deleteOne

const authorAdminQueries = createAdminQueries<
    Prisma.AuthorGetPayload<Prisma.AuthorDefaultArgs>,
    Prisma.AuthorScalarFieldEnum,
    Prisma.AuthorCreateInput,
    Prisma.AuthorUpdateInput
>(db.author as unknown as AnyModel, "author", ["about", "name"])
export const authorGetMany = authorAdminQueries.getMany
export const authorGetOne = authorAdminQueries.getOne
export const authorCreateOne = authorAdminQueries.createOne
export const authorUpdateOne = authorAdminQueries.updateOne
export const authorDeleteOne = authorAdminQueries.deleteOne

const translatorAdminQueries = createAdminQueries<
    Prisma.TranslatorGetPayload<Prisma.TranslatorDefaultArgs>,
    Prisma.TranslatorScalarFieldEnum,
    Prisma.TranslatorCreateInput,
    Prisma.TranslatorUpdateInput
>(db.translator as unknown as AnyModel, "translator", ["name"])
export const translatorGetMany = translatorAdminQueries.getMany
export const translatorGetOne = translatorAdminQueries.getOne
export const translatorCreateOne = translatorAdminQueries.createOne
export const translatorUpdateOne = translatorAdminQueries.updateOne
export const translatorDeleteOne = translatorAdminQueries.deleteOne

const publisherAdminQueries = createAdminQueries<
    Prisma.PublisherGetPayload<Prisma.PublisherDefaultArgs>,
    Prisma.PublisherScalarFieldEnum,
    Prisma.PublisherCreateInput,
    Prisma.PublisherUpdateInput
>(db.publisher as unknown as AnyModel, "publisher", ["name"])
export const publisherGetMany = publisherAdminQueries.getMany
export const publisherGetOne = publisherAdminQueries.getOne
export const publisherCreateOne = publisherAdminQueries.createOne
export const publisherUpdateOne = publisherAdminQueries.updateOne
export const publisherDeleteOne = publisherAdminQueries.deleteOne

const seriesAdminQueries = createAdminQueries<
    Prisma.SeriesGetPayload<Prisma.SeriesDefaultArgs>,
    Prisma.SeriesScalarFieldEnum,
    Prisma.SeriesCreateInput,
    Prisma.SeriesUpdateInput
>(db.series as unknown as AnyModel, "series", ["name"])
export const seriesGetMany = seriesAdminQueries.getMany
export const seriesGetOne = seriesAdminQueries.getOne
export const seriesCreateOne = seriesAdminQueries.createOne
export const seriesUpdateOne = seriesAdminQueries.updateOne
export const seriesDeleteOne = seriesAdminQueries.deleteOne

const categoryAdminQueries = createAdminQueries<
    Prisma.CategoryGetPayload<Prisma.CategoryDefaultArgs>,
    Prisma.CategoryScalarFieldEnum,
    Prisma.CategoryCreateInput,
    Prisma.CategoryUpdateInput
>(db.category as unknown as AnyModel, "category", ["name"])
export const categoryGetMany = categoryAdminQueries.getMany
export const categoryGetOne = categoryAdminQueries.getOne
export const categoryCreateOne = categoryAdminQueries.createOne
export const categoryUpdateOne = categoryAdminQueries.updateOne
export const categoryDeleteOne = categoryAdminQueries.deleteOne

const languageAdminQueries = createAdminQueries<
    Prisma.LanguageGetPayload<Prisma.LanguageDefaultArgs>,
    Prisma.LanguageScalarFieldEnum,
    Prisma.LanguageCreateInput,
    Prisma.LanguageUpdateInput
>(db.language as unknown as AnyModel, "language", [
    "name",
    "iso6391Code",
    "iso6392Code",
])
export const languageGetMany = languageAdminQueries.getMany
export const languageGetOne = languageAdminQueries.getOne
export const languageCreateOne = languageAdminQueries.createOne
export const languageUpdateOne = languageAdminQueries.updateOne
export const languageDeleteOne = languageAdminQueries.deleteOne

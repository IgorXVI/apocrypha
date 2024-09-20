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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PossibleDBOutput = Record<string, any>

type AnyModel = Prisma.PublisherDelegate<DefaultArgs>

async function errorHandler<T>(fun: () => Promise<T>): Promise<CommonDBReturn<T>> {
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

type GetManyInput = {
    take: number
    skip: number
    searchTerm: string
}

type GetManyOutput<T> = {
    total: number
    rows: T[]
}

const getMany =
    <T>({ attrs, model }: { attrs: string[]; model: AnyModel }) =>
    (input: GetManyInput): Promise<CommonDBReturn<GetManyOutput<T>>> =>
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

const createAdminQueries = <T, F extends string, C, U>(model: AnyModel, slug: string, searchAttrs: F[]) => ({
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
export const currencyGetMany = async (...args: Parameters<typeof currencyAdminQueries.getMany>) => currencyAdminQueries.getMany(...args)
export const currencyGetOne = async (...args: Parameters<typeof currencyAdminQueries.getOne>) => currencyAdminQueries.getOne(...args)
export const currencyCreateOne = async (...args: Parameters<typeof currencyAdminQueries.createOne>) => currencyAdminQueries.createOne(...args)
export const currencyUpdateOne = async (...args: Parameters<typeof currencyAdminQueries.updateOne>) => currencyAdminQueries.updateOne(...args)
export const currencyDeleteOne = async (...args: Parameters<typeof currencyAdminQueries.deleteOne>) => currencyAdminQueries.deleteOne(...args)

const authorAdminQueries = createAdminQueries<
    Prisma.AuthorGetPayload<Prisma.AuthorDefaultArgs>,
    Prisma.AuthorScalarFieldEnum,
    Prisma.AuthorCreateInput,
    Prisma.AuthorUpdateInput
>(db.author as unknown as AnyModel, "author", ["about", "name"])
export const authorGetMany = async (...args: Parameters<typeof authorAdminQueries.getMany>) => authorAdminQueries.getMany(...args)
export const authorGetOne = async (...args: Parameters<typeof authorAdminQueries.getOne>) => authorAdminQueries.getOne(...args)
export const authorCreateOne = async (...args: Parameters<typeof authorAdminQueries.createOne>) => authorAdminQueries.createOne(...args)
export const authorUpdateOne = async (...args: Parameters<typeof authorAdminQueries.updateOne>) => authorAdminQueries.updateOne(...args)
export const authorDeleteOne = async (...args: Parameters<typeof authorAdminQueries.deleteOne>) => authorAdminQueries.deleteOne(...args)

const translatorAdminQueries = createAdminQueries<
    Prisma.TranslatorGetPayload<Prisma.TranslatorDefaultArgs>,
    Prisma.TranslatorScalarFieldEnum,
    Prisma.TranslatorCreateInput,
    Prisma.TranslatorUpdateInput
>(db.translator as unknown as AnyModel, "translator", ["name"])
export const translatorGetMany = async (...args: Parameters<typeof translatorAdminQueries.getMany>) => translatorAdminQueries.getMany(...args)
export const translatorGetOne = async (...args: Parameters<typeof translatorAdminQueries.getOne>) => translatorAdminQueries.getOne(...args)
export const translatorCreateOne = async (...args: Parameters<typeof translatorAdminQueries.createOne>) => translatorAdminQueries.createOne(...args)
export const translatorUpdateOne = async (...args: Parameters<typeof translatorAdminQueries.updateOne>) => translatorAdminQueries.updateOne(...args)
export const translatorDeleteOne = async (...args: Parameters<typeof translatorAdminQueries.deleteOne>) => translatorAdminQueries.deleteOne(...args)

const publisherAdminQueries = createAdminQueries<
    Prisma.PublisherGetPayload<Prisma.PublisherDefaultArgs>,
    Prisma.PublisherScalarFieldEnum,
    Prisma.PublisherCreateInput,
    Prisma.PublisherUpdateInput
>(db.publisher as unknown as AnyModel, "publisher", ["name"])
export const publisherGetMany = async (...args: Parameters<typeof publisherAdminQueries.getMany>) => publisherAdminQueries.getMany(...args)
export const publisherGetOne = async (...args: Parameters<typeof publisherAdminQueries.getOne>) => publisherAdminQueries.getOne(...args)
export const publisherCreateOne = async (...args: Parameters<typeof publisherAdminQueries.createOne>) => publisherAdminQueries.createOne(...args)
export const publisherUpdateOne = async (...args: Parameters<typeof publisherAdminQueries.updateOne>) => publisherAdminQueries.updateOne(...args)
export const publisherDeleteOne = async (...args: Parameters<typeof publisherAdminQueries.deleteOne>) => publisherAdminQueries.deleteOne(...args)

const seriesAdminQueries = createAdminQueries<
    Prisma.SeriesGetPayload<Prisma.SeriesDefaultArgs>,
    Prisma.SeriesScalarFieldEnum,
    Prisma.SeriesCreateInput,
    Prisma.SeriesUpdateInput
>(db.series as unknown as AnyModel, "series", ["name"])
export const seriesGetMany = async (...args: Parameters<typeof seriesAdminQueries.getMany>) => seriesAdminQueries.getMany(...args)
export const seriesGetOne = async (...args: Parameters<typeof seriesAdminQueries.getOne>) => seriesAdminQueries.getOne(...args)
export const seriesCreateOne = async (...args: Parameters<typeof seriesAdminQueries.createOne>) => seriesAdminQueries.createOne(...args)
export const seriesUpdateOne = async (...args: Parameters<typeof seriesAdminQueries.updateOne>) => seriesAdminQueries.updateOne(...args)
export const seriesDeleteOne = async (...args: Parameters<typeof seriesAdminQueries.deleteOne>) => seriesAdminQueries.deleteOne(...args)

const categoryAdminQueries = createAdminQueries<
    Prisma.CategoryGetPayload<Prisma.CategoryDefaultArgs>,
    Prisma.CategoryScalarFieldEnum,
    Prisma.CategoryCreateInput,
    Prisma.CategoryUpdateInput
>(db.category as unknown as AnyModel, "category", ["name"])
export const categoryGetMany = async (...args: Parameters<typeof categoryAdminQueries.getMany>) => categoryAdminQueries.getMany(...args)
export const categoryGetOne = async (...args: Parameters<typeof categoryAdminQueries.getOne>) => categoryAdminQueries.getOne(...args)
export const categoryCreateOne = async (...args: Parameters<typeof categoryAdminQueries.createOne>) => categoryAdminQueries.createOne(...args)
export const categoryUpdateOne = async (...args: Parameters<typeof categoryAdminQueries.updateOne>) => categoryAdminQueries.updateOne(...args)
export const categoryDeleteOne = async (...args: Parameters<typeof categoryAdminQueries.deleteOne>) => categoryAdminQueries.deleteOne(...args)

const languageAdminQueries = createAdminQueries<
    Prisma.LanguageGetPayload<Prisma.LanguageDefaultArgs>,
    Prisma.LanguageScalarFieldEnum,
    Prisma.LanguageCreateInput,
    Prisma.LanguageUpdateInput
>(db.language as unknown as AnyModel, "language", ["name", "iso6391Code", "iso6392Code"])
export const languageGetMany = async (...args: Parameters<typeof languageAdminQueries.getMany>) => languageAdminQueries.getMany(...args)
export const languageGetOne = async (...args: Parameters<typeof languageAdminQueries.getOne>) => languageAdminQueries.getOne(...args)
export const languageCreateOne = async (...args: Parameters<typeof languageAdminQueries.createOne>) => languageAdminQueries.createOne(...args)
export const languageUpdateOne = async (...args: Parameters<typeof languageAdminQueries.updateOne>) => languageAdminQueries.updateOne(...args)
export const languageDeleteOne = async (...args: Parameters<typeof languageAdminQueries.deleteOne>) => languageAdminQueries.deleteOne(...args)

export const bookDeleteOne = async (id: string) => deleteOne(db.book as unknown as AnyModel, "book")(id)

type BookDataInput = {
    price: number
    amount: number
    title: string
    descriptionTitle: string
    description: string
    pages: number
    publicationDate: Date
    isbn10Code: string
    isbn13Code: string
    width: number
    height: number
    length: number
    edition?: string
    categoryId: string
    publisherId: string
    languageId: string
    currencyId: string
    seriesId?: string
    imagesArr: string[]
    authorIds: string[]
    translatorIds: string[]
}

const transformBookInput = (data: BookDataInput) => {
    const displayImages = data.imagesArr.map((image, index) => ({
        url: image,
        order: index,
    }))

    const authors = data.authorIds.map((authorId, index) => ({
        authorId,
        main: index === 0,
    }))

    const translators = data.translatorIds.map((translatorId, index) => ({
        translatorId,
        main: index === 0,
    }))

    return {
        amount: data.amount,
        title: data.title,
        descriptionTitle: data.descriptionTitle,
        description: data.description,
        pages: data.pages,
        publicationDate: data.publicationDate,
        isbn10Code: data.isbn10Code,
        isbn13Code: data.isbn13Code,
        width: data.width,
        height: data.height,
        length: data.length,
        price: data.price,
        DisplayImage: { createMany: { data: displayImages } },
        AuthorOnBook: { createMany: { data: authors } },
        TranslatorOnBook: { createMany: { data: translators } },
        Category: { connect: { id: data.categoryId } },
        Publisher: { connect: { id: data.publisherId } },
        Language: { connect: { id: data.languageId } },
        Currency: { connect: { id: data.currencyId } },
    }
}

export const bookCreateOne = async (data: BookDataInput) =>
    errorHandler(async () => {
        const dataForDB = transformBookInput(data)

        const stripeId = "UM ID"

        await db.book.create({
            data: {
                ...dataForDB,
                stripeId,
            },
        })

        revalidatePath(`/admin/book`)

        return undefined
    })

export const bookUpdateOne = async (id: string, data: BookDataInput) =>
    errorHandler(async () => {
        const dataForDB = transformBookInput(data)

        await db.book.update({
            where: {
                id,
            },
            data: dataForDB,
        })

        revalidatePath(`/admin/book`)

        return undefined
    })

export const bookGetOne = async (id: string): Promise<CommonDBReturn<BookDataInput>> =>
    errorHandler(async () => {
        const row = await db.book.findUnique({
            where: {
                id,
            },
            include: {
                AuthorOnBook: {
                    select: {
                        authorId: true,
                    },
                },
                TranslatorOnBook: {
                    select: {
                        bookId: true,
                    },
                },
                DisplayImage: {
                    orderBy: {
                        order: "asc",
                    },
                    select: {
                        url: true,
                    },
                },
            },
        })

        if (!row) {
            throw new Error("Not found")
        }

        return {
            ...row,
            authorIds: row.AuthorOnBook.map((author) => author.authorId),
            translatorIds: row.TranslatorOnBook.map((translator) => translator.bookId),
            imagesArr: row.DisplayImage.map((image) => image.url),
            price: row.price.toNumber(),
            edition: row.edition ?? undefined,
            seriesId: row.seriesId ?? undefined,
        }
    })

export type BookGetManyOutput = {
    id: string
    price: number
    amount: number
    title: string
    descriptionTitle: string
    description: string
    pages: number
    publicationDate: Date
    isbn10Code: string
    isbn13Code: string
    width: number
    height: number
    length: number
    edition?: string
    categoryName: string
    publisherName: string
    languageName: string
    currencyLabel: string
    seriesName?: string
    mainImageUrl: string
    mainAuthorName: string
    mainTranslatorName: string
}

export const bookGetMany = async (input: GetManyInput): Promise<CommonDBReturn<GetManyOutput<BookGetManyOutput>>> =>
    errorHandler(async () => {
        const [rowsResult, totalResult] = await Promise.allSettled([
            db.book.findMany({
                take: input.take,
                skip: input.skip,
                where: {
                    title: {
                        startsWith: input.searchTerm,
                    },
                },
                include: {
                    AuthorOnBook: {
                        where: {
                            main: true,
                        },
                        select: {
                            Author: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    TranslatorOnBook: {
                        where: {
                            main: true,
                        },
                        select: {
                            Translator: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },

                    DisplayImage: {
                        orderBy: {
                            order: "asc",
                        },
                        select: {
                            url: true,
                        },
                        take: 1,
                    },

                    Category: {
                        select: {
                            name: true,
                        },
                    },

                    Publisher: {
                        select: {
                            name: true,
                        },
                    },

                    Language: {
                        select: {
                            name: true,
                        },
                    },

                    Currency: {
                        select: {
                            label: true,
                        },
                    },
                },
            }),

            db.book.count({
                where: {
                    title: {
                        startsWith: input.searchTerm,
                    },
                },
            }),
        ])

        if (rowsResult.status === "rejected") {
            throw rowsResult.reason
        }

        if (totalResult.status === "rejected") {
            throw totalResult.reason
        }

        const total = totalResult.value
        const rows = rowsResult.value.map((row) => ({
            ...row,
            price: row.price.toNumber(),
            edition: row.edition ?? undefined,
            seriesId: row.seriesId ?? undefined,
            mainImageUrl: row.DisplayImage[0]?.url ?? "",
            mainAuthorName: row.AuthorOnBook[0]?.Author.name ?? "",
            mainTranslatorName: row.TranslatorOnBook[0]?.Translator.name ?? "",
            categoryName: row.Category.name,
            publisherName: row.Publisher.name,
            languageName: row.Language.name,
            currencyLabel: row.Currency.label,
        }))

        return {
            total,
            rows,
        }
    })

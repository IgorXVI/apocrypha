"use server"

import { revalidatePath } from "next/cache"

import { db } from "~/server/db"

import { errorHandler } from "./generic-queries"

import { deleteOne } from "./generic-queries"
import { type BookGetManyOneRowOutput, type AnyModel, type CommonDBReturn, type GetManyInput, type GetManyOutput } from "./types"

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

export const bookGetMany = async (input: GetManyInput): Promise<CommonDBReturn<GetManyOutput<BookGetManyOneRowOutput>>> =>
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

export const getCategorySuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.category.findMany({
            where: {
                name: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                name: true,
            },
            take: 5,
        })

        return suggestions
    })

export const getPublisherSuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.publisher.findMany({
            where: {
                name: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                name: true,
            },
            take: 5,
        })

        return suggestions
    })

export const getLanguageSuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.language.findMany({
            where: {
                name: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                name: true,
            },
            take: 5,
        })

        return suggestions
    })

export const getSeriesSuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.series.findMany({
            where: {
                name: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                name: true,
            },
            take: 5,
        })

        return suggestions
    })

export const getCurrencySuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.currency.findMany({
            where: {
                iso4217Code: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                iso4217Code: true,
            },
            take: 5,
        })

        return suggestions.map((s) => ({
            ...s,
            name: s.iso4217Code,
        }))
    })

export const getAuthorSuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.author.findMany({
            where: {
                name: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                name: true,
            },
            take: 5,
        })

        return suggestions
    })

export const getTranslatorSuggestions = async (searchTerm: string) =>
    errorHandler(async () => {
        const suggestions = await db.translator.findMany({
            where: {
                name: {
                    startsWith: searchTerm,
                },
            },
            select: {
                id: true,
                name: true,
            },
            take: 5,
        })

        return suggestions
    })

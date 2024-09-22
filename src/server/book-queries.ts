"use server"

import { revalidatePath } from "next/cache"

import { db } from "~/server/db"

import { errorHandler } from "./generic-queries"

import { deleteOne } from "./generic-queries"
import { type BookGetManyOneRowOutput, type AnyModel, type CommonDBReturn, type GetManyInput, type GetManyOutput } from "./types"
import { archiveProduct, createProduct } from "./stripe-api"

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
    mainImgUrl: string
    authorId: string
    translatorId: string
    imgUrls: string[]
}

const transformBookInput = (data: BookDataInput) => {
    const displayImages = [data.mainImgUrl].concat(data.imgUrls).map((image, index) => ({
        url: image,
        order: index,
    }))

    const authors = [
        {
            authorId: data.authorId,
            main: true,
        },
    ]

    const translators = [
        {
            translatorId: data.translatorId,
            main: true,
        },
    ]

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
        edition: data.edition,
        DisplayImage: { createMany: { data: displayImages } },
        AuthorOnBook: { createMany: { data: authors } },
        TranslatorOnBook: { createMany: { data: translators } },
        Category: { connect: { id: data.categoryId } },
        Publisher: { connect: { id: data.publisherId } },
        Language: { connect: { id: data.languageId } },
        Currency: { connect: { id: data.currencyId } },
        Series: data.seriesId ? { connect: { id: data.seriesId } } : undefined,
    }
}

const createStripeProduct = async (data: BookDataInput) => {
    const currency = await db.currency.findUnique({
        where: {
            id: data.currencyId,
        },
        select: {
            iso4217Code: true,
        },
    })

    if (!currency) {
        throw new Error("Currency not found")
    }

    const stripeResponse = await createProduct({
        name: data.title,
        price: data.price,
        currency: currency.iso4217Code,
        mainImg: data.mainImgUrl,
    })

    if (!stripeResponse.success) {
        throw new Error(stripeResponse.message)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return stripeResponse.productId
}

export const bookCreateOne = async (data: BookDataInput) =>
    errorHandler(async () => {
        const stripeId = await createStripeProduct(data)

        const dataForDB = transformBookInput(data)

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
        const authorIds = [data.authorId]
        const translatorIds = [data.translatorId]

        const bookDBData = await db.book.findUnique({
            where: {
                id,
            },
            include: {
                Currency: {
                    select: {
                        id: true,
                    },
                },
                DisplayImage: {
                    take: 1,
                    where: {
                        order: 0,
                    },
                    select: {
                        url: true,
                    },
                },
                AuthorOnBook: {
                    where: {
                        authorId: {
                            notIn: authorIds,
                        },
                    },
                    select: {
                        authorId: true,
                    },
                },
                TranslatorOnBook: {
                    where: {
                        translatorId: {
                            notIn: translatorIds,
                        },
                    },
                    select: {
                        translatorId: true,
                    },
                },
            },
        })

        if (!bookDBData) {
            throw new Error("Book not found")
        }

        let stripeId = bookDBData.stripeId

        if (
            data.title !== bookDBData.title ||
            data.price !== bookDBData.price.toNumber() ||
            data.currencyId !== bookDBData.Currency.id ||
            data.mainImgUrl !== bookDBData.DisplayImage[0]?.url
        ) {
            const archiveProductResponse = await archiveProduct(bookDBData.stripeId)

            if (!archiveProductResponse.success && !archiveProductResponse.message.includes("No such product")) {
                throw new Error(archiveProductResponse.message)
            }

            stripeId = await createStripeProduct(data)
        }

        const deleteAuthorOnBook = bookDBData?.AuthorOnBook.map((author) => ({
            bookId: id,
            authorId: author.authorId,
        }))

        const deleteTranslatorOnBook = bookDBData?.TranslatorOnBook.map((translator) => ({
            bookId: id,
            translatorId: translator.translatorId,
        }))

        const dataForDB = transformBookInput(data)

        await db.book
            .update({
                where: {
                    id,
                },
                data: {
                    ...dataForDB,
                    stripeId,
                    DisplayImage: {
                        updateMany: dataForDB.DisplayImage.createMany.data.map((image) => ({
                            where: {
                                order: image.order,
                            },
                            data: {
                                url: image.url,
                            },
                        })),
                    },
                    AuthorOnBook: {
                        deleteMany: deleteAuthorOnBook.length > 0 ? deleteAuthorOnBook : undefined,
                        connectOrCreate:
                            authorIds.length > 0
                                ? authorIds.map((authorId) => ({
                                      where: {
                                          bookId_authorId: {
                                              bookId: id,
                                              authorId,
                                          },
                                      },
                                      create: {
                                          authorId,
                                          main: true,
                                      },
                                  }))
                                : undefined,
                    },
                    TranslatorOnBook: {
                        deleteMany: deleteTranslatorOnBook.length > 0 ? deleteTranslatorOnBook : undefined,
                        connectOrCreate:
                            translatorIds.length > 0
                                ? translatorIds.map((translatorId) => ({
                                      where: {
                                          bookId_translatorId: {
                                              bookId: id,
                                              translatorId,
                                          },
                                      },
                                      create: {
                                          translatorId,
                                          main: true,
                                      },
                                  }))
                                : undefined,
                    },
                },
            })
            .catch((error) => {
                if (bookDBData.stripeId !== stripeId) {
                    archiveProduct(stripeId).catch((e) => console.error(e))
                }
                throw error
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
                        translatorId: true,
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

        const allImgUrls = row.DisplayImage.map((image) => image.url)

        return {
            ...row,
            authorId: row.AuthorOnBook[0]?.authorId ?? "",
            translatorId: row.TranslatorOnBook[0]?.translatorId ?? "",
            mainImgUrl: allImgUrls[0] ?? "",
            imgUrls: allImgUrls.slice(1),
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

                    Series: {
                        select: {
                            name: true,
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
            mainImageUrl: row.DisplayImage[0]?.url ?? "",
            mainAuthorName: row.AuthorOnBook[0]?.Author.name ?? "",
            mainTranslatorName: row.TranslatorOnBook[0]?.Translator.name ?? "",
            categoryName: row.Category.name,
            publisherName: row.Publisher.name,
            languageName: row.Language.name,
            currencyLabel: row.Currency.label,
            seriesName: row.Series?.name ?? undefined,
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

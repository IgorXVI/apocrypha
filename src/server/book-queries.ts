"server-only"

import { type z } from "zod"

import { db } from "~/server/db"

import { errorHandler } from "./generic-queries"

import { type BookGetManyOneRowOutput, type CommonDBReturn, type GetManyInput, type GetManyOutput } from "../lib/types"
import { archiveProduct, createProduct, getProductPrice, getProductsPricesMap, restoreProduct } from "./stripe-api"

import { type bookValidationSchema } from "~/lib/validation"

type BookDataInput = z.infer<typeof bookValidationSchema>

const transformBookInput = (data: BookDataInput) => {
    const displayImages = [data.mainImgUrl].concat(data.imgUrls).map((image, index) => ({
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
        isAvailable: data.isAvailable,
        title: data.title,
        description: data.description,
        pages: data.pages,
        publicationDate: data.publicationDate,
        isbn10Code: data.isbn10Code,
        isbn13Code: data.isbn13Code,
        edition: data.edition,
        literatureType: data.literatureType,
        language: data.language,
        DisplayImage: { createMany: { data: displayImages } },
        AuthorOnBook: { createMany: { data: authors } },
        TranslatorOnBook: { createMany: { data: translators } },
        Category: { connect: { id: data.categoryId } },
        Publisher: { connect: { id: data.publisherId } },
        Series: data.seriesId ? { connect: { id: data.seriesId } } : undefined,
        RelatedBook: data.relatedBookId ? { connect: { id: data.relatedBookId } } : undefined,
    }
}

const createStripeProduct = async (data: BookDataInput) => {
    const stripeResponse = await createProduct({
        name: data.title,
        price: data.price,
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

        await db.book
            .create({
                data: {
                    ...dataForDB,
                    stripeId,
                },
            })
            .catch((error) => {
                archiveProduct(stripeId).catch((e) => console.error("Error archiving product", e))
                throw error
            })

        return undefined
    })

export const bookUpdateOne = async (id: string, data: BookDataInput) =>
    errorHandler(async () => {
        const bookDBData = await db.book.findUnique({
            where: {
                id,
            },
            include: {
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
                            notIn: data.authorIds,
                        },
                    },
                    select: {
                        authorId: true,
                    },
                },
                TranslatorOnBook: {
                    where: {
                        translatorId: {
                            notIn: data.translatorIds,
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

        if (data.title !== bookDBData.title || data.mainImgUrl !== bookDBData.DisplayImage[0]?.url) {
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
                            data.authorIds.length > 0
                                ? data.authorIds.map((authorId) => ({
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
                            data.translatorIds.length > 0
                                ? data.translatorIds.map((translatorId) => ({
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
                    archiveProduct(stripeId).catch((e) => console.error("Error archiving product", e))
                }
                throw error
            })

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
                    orderBy: {
                        main: "asc",
                    },
                },
                TranslatorOnBook: {
                    select: {
                        translatorId: true,
                    },
                    orderBy: {
                        main: "asc",
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

        const stripePrice = await getProductPrice(row.stripeId)

        if (!stripePrice.success) {
            throw new Error(stripePrice.message)
        }

        const allImgUrls = row.DisplayImage.map((image) => image.url)

        return {
            ...row,
            isbn10Code: row.isbn10Code ?? undefined,
            isbn13Code: row.isbn13Code ?? undefined,
            relatedBookId: row.relatedBookId ?? undefined,
            authorIds: row.AuthorOnBook.map((author) => author.authorId),
            translatorIds: row.TranslatorOnBook.map((translator) => translator.translatorId),
            mainImgUrl: allImgUrls[0] ?? "",
            imgUrls: allImgUrls.slice(1),
            edition: row.edition ?? undefined,
            seriesId: row.seriesId ?? undefined,
            price: stripePrice.price ?? 0,
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
                        orderBy: {
                            main: "asc",
                        },
                        take: 1,
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
                        orderBy: {
                            main: "asc",
                        },
                        take: 1,
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

                    Series: {
                        select: {
                            name: true,
                        },
                    },

                    RelatedBook: {
                        select: {
                            title: true,
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

        const pricesData = await getProductsPricesMap(rowsResult.value.map((row) => row.stripeId))

        if (!pricesData.success) {
            throw new Error(pricesData.message)
        }

        const total = totalResult.value
        const rows = rowsResult.value.map((row) => ({
            ...row,
            isbn10Code: row.isbn10Code ?? undefined,
            isbn13Code: row.isbn13Code ?? undefined,
            price: pricesData.pricesMap?.get(row.stripeId) ?? 0,
            edition: row.edition ?? undefined,
            mainImageUrl: row.DisplayImage[0]?.url ?? "",
            mainAuthorName: row.AuthorOnBook[0]?.Author.name ?? "",
            mainTranslatorName: row.TranslatorOnBook[0]?.Translator.name ?? "",
            categoryName: row.Category.name,
            publisherName: row.Publisher.name,
            seriesName: row.Series?.name ?? undefined,
            relatedBookTitle: row.RelatedBook?.title ?? undefined,
        }))

        return {
            total,
            rows,
        }
    })

export const bookDeleteOne = (id: string) =>
    errorHandler(async () => {
        const bookDBData = await db.book.findUnique({
            where: {
                id,
            },
            select: {
                stripeId: true,
            },
        })

        if (!bookDBData) {
            throw new Error("Book not found")
        }

        const archiveProductResponse = await archiveProduct(bookDBData.stripeId)

        if (!archiveProductResponse.success) {
            throw new Error(archiveProductResponse.message)
        }

        await db
            .$transaction([
                db.displayImage.deleteMany({
                    where: {
                        bookId: id,
                    },
                }),
                db.authorOnBook.deleteMany({
                    where: {
                        bookId: id,
                    },
                }),
                db.translatorOnBook.deleteMany({
                    where: {
                        bookId: id,
                    },
                }),
                db.book.delete({
                    where: {
                        id,
                    },
                }),
            ])
            .catch((error) => {
                restoreProduct(bookDBData.stripeId).catch((e) => console.error("Error restoring product", e))
                throw error
            })

        return undefined
    })

import "server-only"

import { db } from "~/server/db"

import { errorHandler } from "./generic-queries"

import { type BookGetManyOneRowOutput, type CommonDBReturn, type GetManyInput, type GetManyOutput } from "../lib/types"
import { archiveProduct, createProduct, restoreProduct, updateProduct } from "./stripe-api"

import { type BookSchemaType } from "~/lib/validation"

const transformIdsWithMain = (ids: string[], mainId?: string) => {
    let allIds = [...ids]
    if (mainId) {
        allIds = allIds.filter((id) => id !== mainId)
        allIds.unshift(mainId)
    }
    return allIds
}

const transformBookInput = (data: BookSchemaType) => {
    const displayImages = transformIdsWithMain(data.imgUrls, data.mainImgUrl).map((image, index) => ({
        url: image,
        order: index,
    }))

    const authors = transformIdsWithMain(data.authorIds, data.mainAuthorId).map((authorId, index) => ({
        authorId,
        main: index === 0,
    }))

    const translators = transformIdsWithMain(data.translatorIds, data.mainTranslatorId).map((translatorId, index) => ({
        translatorId,
        main: index === 0,
    }))

    const categories = transformIdsWithMain(data.categoryIds, data.mainCategoryId).map((categoryId, index) => ({
        categoryId,
        main: index === 0,
    }))

    return {
        title: data.title,
        stock: data.stock,
        description: data.description,
        pages: data.pages,
        price: data.price,
        publicationDate: data.publicationDate,
        isbn10Code: data.isbn10Code,
        isbn13Code: data.isbn13Code,
        edition: data.edition,
        language: data.language,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
        thicknessCm: data.thicknessCm,
        weightGrams: data.weightGrams,
        DisplayImage: { createMany: { data: displayImages } },
        AuthorOnBook: { createMany: { data: authors } },
        TranslatorOnBook: { createMany: { data: translators } },
        CategoryOnBook: { createMany: { data: categories } },
        Publisher: { connect: { id: data.publisherId } },
        Series: data.seriesId ? { connect: { id: data.seriesId } } : undefined,
        placeInSeries: data.placeInSeries,
        RelatedBook: data.relatedBookId ? { connect: { id: data.relatedBookId } } : undefined,
    }
}

export const bookCreateOne = async (data: BookSchemaType) =>
    errorHandler(async () => {
        const stripeResponse = await createProduct({
            name: data.title,
            price: data.price,
            mainImg: data.mainImgUrl,
        })

        if (!stripeResponse.success) {
            throw new Error(stripeResponse.message)
        }

        const stripeId = stripeResponse.productId

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

export const bookUpdateOne = async (id: string, data: BookSchemaType) =>
    errorHandler(async () => {
        const allAuthorIds = [data.mainAuthorId, ...data.authorIds]

        const allTranslatorIds = data.translatorIds
        if (data.mainTranslatorId) {
            allTranslatorIds.unshift(data.mainTranslatorId)
        }

        const allCategoryIds = [data.mainCategoryId, ...data.categoryIds]

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
                            notIn: allAuthorIds,
                        },
                    },
                    select: {
                        authorId: true,
                    },
                },
                TranslatorOnBook: {
                    where: {
                        translatorId: {
                            notIn: allTranslatorIds,
                        },
                    },
                    select: {
                        translatorId: true,
                    },
                },
                CategoryOnBook: {
                    where: {
                        categoryId: {
                            notIn: allCategoryIds,
                        },
                    },
                    select: {
                        categoryId: true,
                    },
                },
            },
        })

        if (!bookDBData) {
            throw new Error("Book not found")
        }

        if (data.title !== bookDBData.title || data.mainImgUrl !== bookDBData.DisplayImage[0]?.url || data.price !== bookDBData.price.toNumber()) {
            const stripeResponse = await updateProduct(bookDBData.stripeId, {
                name: data.title,
                price: data.price,
                mainImg: data.mainImgUrl,
            })

            if (!stripeResponse.success) {
                throw new Error(stripeResponse.message)
            }
        }

        const deleteAuthorOnBook = bookDBData?.AuthorOnBook.map((author) => ({
            bookId: id,
            authorId: author.authorId,
        }))

        const deleteTranslatorOnBook = bookDBData?.TranslatorOnBook.map((translator) => ({
            bookId: id,
            translatorId: translator.translatorId,
        }))

        const deleteCategoryOnBook = bookDBData?.CategoryOnBook.map((category) => ({
            bookId: id,
            categoryId: category.categoryId,
        }))

        const dataForDB = transformBookInput(data)

        await db.book.update({
            where: {
                id,
            },
            data: {
                ...dataForDB,
                prevPrice: dataForDB.price !== bookDBData.price.toNumber() ? bookDBData.price : undefined,
                Series: data.seriesId
                    ? dataForDB.Series
                    : {
                          disconnect: {
                              id: bookDBData.seriesId ?? "",
                          },
                      },
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
                        allAuthorIds.length > 0
                            ? allAuthorIds.map((authorId) => ({
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
                        allTranslatorIds.length > 0
                            ? allTranslatorIds.map((translatorId) => ({
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
                CategoryOnBook: {
                    deleteMany: deleteCategoryOnBook.length > 0 ? deleteCategoryOnBook : undefined,
                    connectOrCreate:
                        allCategoryIds.length > 0
                            ? allCategoryIds.map((categoryId) => ({
                                  where: {
                                      bookId_categoryId: {
                                          bookId: id,
                                          categoryId,
                                      },
                                  },
                                  create: {
                                      categoryId,
                                      main: true,
                                  },
                              }))
                            : undefined,
                },
            },
        })

        return undefined
    })

export const bookGetOne = async (id: string): Promise<CommonDBReturn<BookSchemaType>> =>
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
                CategoryOnBook: {
                    select: {
                        categoryId: true,
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

        const allImgUrls = row.DisplayImage.map((image) => image.url)

        const allAuthorIds = row.AuthorOnBook.map((author) => author.authorId)
        const allTranslatorIds = row.TranslatorOnBook.map((translator) => translator.translatorId)
        const allCategoryIds = row.CategoryOnBook.map((category) => category.categoryId)

        return {
            ...row,
            isbn10Code: row.isbn10Code ?? undefined,
            isbn13Code: row.isbn13Code ?? undefined,
            relatedBookId: row.relatedBookId ?? undefined,
            mainAuthorId: allAuthorIds[0] ?? "",
            authorIds: allAuthorIds.slice(1),
            mainTranslatorId: allTranslatorIds[0] ?? "",
            translatorIds: allTranslatorIds.slice(1),
            mainCategoryId: allCategoryIds[0] ?? "",
            categoryIds: allCategoryIds.slice(1),
            mainImgUrl: allImgUrls[0] ?? "",
            imgUrls: allImgUrls.slice(1),
            edition: row.edition ?? undefined,
            seriesId: row.seriesId ?? undefined,
            price: row.price.toNumber(),
        }
    })

export const bookGetMany = async (input: GetManyInput): Promise<CommonDBReturn<GetManyOutput<BookGetManyOneRowOutput>>> =>
    errorHandler(async () => {
        const [rowsResult, totalResult] = await Promise.allSettled([
            db.book.findMany({
                take: input.take ?? 10,
                skip: input.skip,
                where: input.searchTerm.includes("IDS-->")
                    ? {
                          id: {
                              in: input.searchTerm
                                  .split("__AND__")
                                  .filter((s) => s.length > 0)
                                  .map((s) => s.replace("IDS-->", "")),
                          },
                      }
                    : {
                          title: {
                              contains: input.searchTerm,
                              mode: "insensitive",
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

                    CategoryOnBook: {
                        select: {
                            Category: {
                                include: {
                                    SuperCategory: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: {
                            main: "asc",
                        },
                        take: 1,
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
                orderBy: {
                    title: "asc",
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
            isbn10Code: row.isbn10Code ?? undefined,
            isbn13Code: row.isbn13Code ?? undefined,
            price: row.price.toNumber(),
            prevPrice: row.prevPrice.toNumber(),
            edition: row.edition ?? undefined,
            mainImageUrl: row.DisplayImage[0]?.url ?? "",
            mainAuthorName: row.AuthorOnBook[0]?.Author.name ?? "",
            mainTranslatorName: row.TranslatorOnBook[0]?.Translator.name ?? "",
            categoryName: `${row.CategoryOnBook[0]?.Category.SuperCategory?.name ?? "N/A"}->${row.CategoryOnBook[0]?.Category.name ?? "N/A"}`,
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
                db.categoryOnBook.deleteMany({
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

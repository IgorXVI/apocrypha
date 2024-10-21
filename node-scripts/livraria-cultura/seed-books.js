import fs from "fs"
import path from "path"

import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient } from "@prisma/client"

import Stripe from "stripe"
import dotenv from "dotenv"

neonConfig.webSocketConstructor = ws
const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const db = new PrismaClient({ adapter })

dotenv.config()

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-06-20",
})

const main = async () => {
    const fileContent = fs.readFileSync(path.resolve("./node-scripts/livraria-cultura/main-dump/new-books-stripe.json"))

    /**
     * @type {{ stripeId: string; mainCategoryId: string; publisherId: string; mainAuthorId: string; pages: number; price: number; stock: number; title: string; description: string; publicationDate: Date; edition: number; heightCm: number; widthCm: number; thicknessCm: number; weightGrams: number; imgUrls: string[]; mainImgUrl: string; placeInSeries: number; authorIds: string[]; translatorIds: string[]; categoryIds: string[]; mainTranslatorId?: string | undefined; isbn13Code?: string | undefined; isbn10Code?: string | undefined; language?: "PORTUGUESE" | "ENGLISH" | "SPANISH" | "FRENCH" | "ITALIAN" | "GERMAN" | "TURKISH" | "RUSSIAN" | "ARABIC" | "PORTUGUESE_BRAZILIAN" | undefined; seriesId?: string | undefined; relatedBookId?: string | undefined; }[]}
     */
    const fileJSON = JSON.parse(fileContent.toString())

    const transformIdsWithMain = (/**@type {string[]}*/ ids, /**@type {string | undefined}*/ mainId) => {
        let allIds = [...ids]
        if (mainId) {
            allIds = allIds.filter((id) => id !== mainId)
            allIds.unshift(mainId)
        }
        return allIds
    }

    const books = fileJSON.map((data) => {
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
            stripeId: data.stripeId,
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
    })

    let promises = []

    for (const book of books) {
        if (promises.length > 100) {
            console.log("SAVING BOOKS CHUNK")
            await Promise.all(promises)
            promises = []
        }

        promises.push(
            db.book
                .create({
                    data: book,
                })
                .catch((error) => {
                    if (error.message?.includes("Argument `stripeId` is missing.")) {
                        return stripe.products
                            .create({
                                name: book.title,
                                images: [book.DisplayImage.createMany.data[0]?.url ?? ""],
                                default_price_data: {
                                    currency: "brl",
                                    unit_amount: Math.ceil(book.price * 100),
                                },
                                shippable: true,
                            })
                            .then((res) => {
                                return db.book.create({
                                    data: {
                                        ...book,
                                        stripeId: res.id,
                                    },
                                })
                            })
                            .catch((error) => {
                                console.log("AFTER STRIPE ERROR", error)
                            })
                    }

                    if (!error.message || (error.message && !error.message.includes("Unique constraint failed on the fields:"))) {
                        console.log("ERROR ON BOOK", book.title, error)
                    }
                }),
        )
    }

    if (promises.length > 0) {
        console.log("SAVING LAST BOOKS CHUNK")
        await Promise.all(promises)
    }

    console.log("DONE")
}

main().catch((error) => console.error(error))

import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient, Langs } from "@prisma/client"

import fs from "fs"
import path from "path"
import { z } from "zod"

import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-06-20",
})

neonConfig.webSocketConstructor = ws
const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const db = new PrismaClient({ adapter })

const bookValidationSchema = z.object({
    price: z.number().positive({ message: "O preço deve ser um número positivo." }).default(0),
    stock: z.number().nonnegative({ message: "A quantidade em estoque deve ser um número positivo ou zero." }).default(0),
    title: z.string().min(1, { message: "O título é obrigatório." }).default(""),
    description: z.string({ required_error: "A descrição é obrigatória." }).default(""),
    pages: z.number().int().positive({ message: "O número de páginas deve ser um número inteiro positivo." }).default(0),
    publicationDate: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date({ required_error: "A data de publicação é obrigatória." }),
    ),
    isbn10Code: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().length(10, { message: "O ISBN-10 deve ter exatamente 10 caracteres." }).optional(),
    ),
    isbn13Code: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().length(13, { message: "O ISBN-13 deve ter exatamente 13 caracteres." }).optional(),
    ),
    edition: z.number().int().positive({ message: "A edição deve ser um número inteiro positivo." }).default(1),

    heightCm: z.number().positive({ message: "A altura deve ser um número positivo." }).default(0),
    widthCm: z.number().positive({ message: "A largura deve ser um número positivo." }).default(0),
    thicknessCm: z.number().positive({ message: "A grossura deve ser um número positivo." }).default(0),
    weightGrams: z.number().positive({ message: "O peso deve ser um número positivo." }).default(0),

    language: z.nativeEnum(Langs).optional(),

    imgUrls: z.array(z.string().url({ message: "URL da imagem inválida." })).default([]),
    mainImgUrl: z.string().url({ message: "URL da imagem inválida." }).default(""),

    publisherId: z.string().uuid({ message: "O ID da editora é inválido." }).default(""),
    seriesId: z.string().uuid({ message: "O ID da série é inválido." }).optional(),
    placeInSeries: z.number().int().nonnegative({ message: "A posição na série deve ser um número inteiro positivo." }).default(0),

    authorIds: z.array(z.string().uuid({ message: "ID do autor inválido." })).default([]),
    translatorIds: z.array(z.string().uuid({ message: "ID do tradutor inválido." })).default([]),
    categoryIds: z.array(z.string().uuid({ message: "ID da categoria inválido." })).default([]),

    mainAuthorId: z.string().uuid({ message: "ID do autor inválido." }).default(""),
    mainTranslatorId: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().uuid({ message: "ID do tradutor inválido." }).optional(),
    ),
    mainCategoryId: z.string().uuid({ message: "ID da categoria inválido." }).default(""),

    relatedBookId: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().uuid({ message: "ID do livro relacionado inválido." }).optional(),
    ),
})

const main = async () => {
    const dirFiles = fs.readdirSync(path.resolve("./node-scripts/livraria-cultura/dump"))

    const bookCategoryFiles = dirFiles.filter((f) => f.startsWith("livros-categori"))

    const existingImgFiles = dirFiles.filter((f) => f.startsWith("book-img"))

    const categoryFilesMap = bookCategoryFiles.reduce((filesMap, f) => {
        const catKey = f.replace("livros-categoria____", "").replace(".json", "").replace("__&__", "/")

        const filePath = path.resolve(`./node-scripts/livraria-cultura/dump/${f}`)

        const fileStr = fs.readFileSync(filePath).toString()

        let fileContent = JSON.parse(fileStr)

        fileContent = fileContent.filter((/** @type {any} */ c) => c !== null)

        filesMap.set(catKey, fileContent)

        return filesMap
    }, new Map())

    const categories = await db.superCategory.findMany({
        include: {
            Category: true,
        },
    })

    const authors = await db.author.findMany()

    console.log(`existing authors ${authors.length}`)

    const translators = await db.translator.findMany()

    console.log(`existing translators ${translators.length}`)

    const publishers = await db.publisher.findMany()

    console.log(`existing publishers ${publishers.length}`)

    /**
     * @type {Record<string, string>}
     */
    const authorsMap = {}
    /**
     * @type {Record<string, string>}
     */
    const translatorsMap = {}
    /**
     * @type {Record<string, string>}
     */
    const publishersMap = {}

    authors.forEach((author) => {
        authorsMap[author.name] = author.id
    })

    translators.forEach((translator) => {
        translatorsMap[translator.name] = translator.id
    })

    publishers.forEach((publisher) => {
        publishersMap[publisher.name] = publisher.id
    })

    /**
     * @type {{ name: string; imgUrl: string; about: string; }[]}
     */
    const newAuthors = []
    /**
     * @type {{ name: string; }[]}
     */
    const newTranslators = []
    /**
     * @type {{ name: string; }[]}
     */
    const newPublishers = []

    for (const DBSuperCategory of categories) {
        for (const DBCategory of DBSuperCategory.Category) {
            const key = `${DBSuperCategory.name}____${DBCategory.name}`

            const content = categoryFilesMap.get(key)

            if (!content) {
                console.log(`${key} has no content`)
                continue
            }

            for (const c of content) {
                c.mainCategoryId = DBCategory.id

                if (!publishersMap[c.publisherId]) {
                    publishersMap[c.publisherId] = "UM_ID"
                    newPublishers.push({
                        name: c.publisherId,
                    })
                }

                if (!authorsMap[c.mainAuthorId]) {
                    authorsMap[c.mainAuthorId] = "UM_ID"
                    newAuthors.push({
                        name: c.mainAuthorId,
                        imgUrl: "https://utfs.io/f/V4ibhetxoONe1zfy0hRbUDrHfVaB2oI0tFgxG5AXTvuJQCR8",
                        about: "N/A",
                    })
                }

                if (c.mainTranslatorId && !translatorsMap[c.mainTranslatorId]) {
                    translatorsMap[c.mainTranslatorId] = "UM_ID"
                    newTranslators.push({
                        name: c.mainTranslatorId,
                    })
                }
            }
        }
    }

    if (newAuthors.length > 0 || newPublishers.length > 0 || newTranslators.length) {
        console.log("HAD NEW DATA THAT IS NOT BOOKS")

        console.log("START")

        console.log(`new authors ${newAuthors.length}`)
        console.log(`new publishers ${newPublishers.length}`)
        console.log(`new translators ${newTranslators.length}`)

        await Promise.all([
            db.author
                .createMany({ data: newAuthors, skipDuplicates: true })
                .then(() => console.log("AUTHOR DONE"))
                .catch((error) => console.error(error)),

            db.publisher
                .createMany({ data: newPublishers, skipDuplicates: true })
                .then(() => console.log("PUBLISHER DONE"))
                .catch((error) => console.error(error)),

            db.translator
                .createMany({ data: newTranslators, skipDuplicates: true })
                .then(() => console.log("TRANSLATOR DONE"))
                .catch((error) => console.error(error)),
        ])

        console.log("DONE")

        throw new Error("PLEASE RUN THIS SCRIPT AGAIN TO SAVE THE BOOKS")
    }

    const newBooks = []

    for (const DBSuperCategory of categories) {
        for (const DBCategory of DBSuperCategory.Category) {
            const key = `${DBSuperCategory.name}____${DBCategory.name}`

            const content = categoryFilesMap.get(key)

            if (!content) {
                console.log(`${key} has no content`)
                continue
            }

            for (const c of content) {
                c.mainCategoryId = DBCategory.id

                c.publisherId = publishersMap[c.publisherId]
                c.mainAuthorId = authorsMap[c.mainAuthorId]
                if (c.mainTranslatorId) {
                    c.mainTranslatorId = translatorsMap[c.mainTranslatorId]
                }

                if (c.isbn13Code === c.isbn10Code) {
                    c.isbn13Code = undefined
                }

                if (c.pages === 0) {
                    c.pages = 100
                }

                const validRes = bookValidationSchema.safeParse(c)

                if (!validRes.success) {
                    console.log(validRes.error.issues)
                    throw new Error("VALIDATION FAILED")
                }

                newBooks.push(validRes.data)
            }
        }
    }

    /**
     * @type {Record<string, boolean>}
     */
    const passedBook = {}

    /**
     * @type {{ mainCategoryId: string; publisherId: string; mainAuthorId: string; pages: number; price: number; stock: number; title: string; description: string; publicationDate: Date; edition: number; heightCm: number; widthCm: number; thicknessCm: number; weightGrams: number; imgUrls: string[]; mainImgUrl: string; placeInSeries: number; authorIds: string[]; translatorIds: string[]; categoryIds: string[]; mainTranslatorId?: string | undefined; isbn13Code?: string | undefined; isbn10Code?: string | undefined; language?: "PORTUGUESE" | "ENGLISH" | "SPANISH" | "FRENCH" | "ITALIAN" | "GERMAN" | "TURKISH" | "RUSSIAN" | "ARABIC" | "PORTUGUESE_BRAZILIAN" | undefined; seriesId?: string | undefined; relatedBookId?: string | undefined; }[]}
     */
    const uniqueBooks = []
    newBooks.forEach((book) => {
        if (!passedBook[book.title]) {
            passedBook[book.title] = true
            uniqueBooks.push(book)
        }
    })

    await db.$disconnect().then(() => console.log("db connection closed"))

    console.log(`new books ${uniqueBooks.length}`)

    const convertCulturaUrlToLocalFileName = (/** @type {string} */ url) => {
        const imgType = url.split("?")[0]?.replace("https://livrariacultura.vteximg.com.br", "").split(".")[1]?.trim()
        const name = url.replace("https://livrariacultura.vteximg.com.br", "").replaceAll("/", "&__").replaceAll(".", "").replace("?v=", "")
        return `book-img____${name}.${imgType}`
    }

    let imgFilesPromises = []

    for (const book of uniqueBooks) {
        const fileName = convertCulturaUrlToLocalFileName(book.mainImgUrl)

        if (existingImgFiles.includes(fileName)) {
            continue
        }

        if (imgFilesPromises.length > 100) {
            console.log("SAVING IMAGES...")
            await Promise.all(imgFilesPromises)
            imgFilesPromises = []
        }

        const imgFilePromise = fetch(book.mainImgUrl ?? "")
            .then((res) => res.arrayBuffer())
            .then((content) => fs.promises.writeFile(path.resolve(`./node-scripts/livraria-cultura/dump/${fileName}`), Buffer.from(content)))
            .catch((error) => {
                console.error("ERROR trying to create file:", fileName, error)
            })

        imgFilesPromises.push(imgFilePromise)
    }

    uniqueBooks.forEach((book) => {
        const fileName = convertCulturaUrlToLocalFileName(book.mainImgUrl)
        book.mainImgUrl = path.resolve(`./node-scripts/livraria-cultura/dump/${fileName}`)
    })

    fs.writeFileSync(path.resolve("./node-scripts/livraria-cultura/dump/new-books-local-imgs.json"), JSON.stringify(uniqueBooks))
    console.log("DONE")
}

main().catch((error) => console.error(error))

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import fs from "fs"
import _ from "lodash"
import path from "path"

import { categoriesConfig } from "./categories-config.js"

console.log("RUNNING...")

const fetchJSON2 = async (url = "") => {
    const result = await fetch(url)

    const body = await result.text()

    const cleanHTML = body
        .split(`<div style="display: none"><vtex.cmc:userLogin/></div>`)[0]
        ?.split(`<!-- End - WebAnalyticsViewPart -->`)[1]
        ?.split("var skuJson_0 = ")[1]
        ?.split(";CATALOG_SDK.setProductWithVariationsCache")[0]

    return JSON.parse(cleanHTML ?? "")
}

const langsMap = {
    inglês: "ENGLISH",
    espanhol: "SPANISH",
    francês: "FRENCH",
    alemão: "GERMAN",
    italiano: "ITALIAN",
    turco: "TURKISH",
    russo: "RUSSIAN",
    árabe: "ARABIC",
    português: "PORTUGUESE_BRAZILIAN",
}

const main = async () => {
    for (const categoryConfig of categoriesConfig) {
        if (categoryConfig.done === true) {
            continue
        }

        const result = await fetch(categoryConfig.url)

        const json1 = await result.json()

        const booksContents = []

        for (const book of json1) {
            console.log(`READING "${book.productName}"...`)

            if (!book["Páginas"] || !book.Idioma) {
                console.log("SKIPED")
                continue
            }

            const json2 = await fetchJSON2(book.link)

            const bookContent = {
                price: book.items[0].sellers[0].commertialOffer.ListPrice,
                stock: 10,

                title: book.productName
                    .split(" ")
                    .map((s, i) => (i !== 0 && s.length < 4 ? s.toLowerCase() : _.capitalize(s.toLowerCase())))
                    .join(" ")
                    .trim()
                    .replaceAll("  ", " "),

                description: book.description,
                pages: Number(book["Páginas"][0]),
                publicationDate: book.releaseDate,
                isbn10Code: book.ISBN[0],
                isbn13Code: book.items[0].ean,
                edition: Number(book["Edição"][0]),

                heightCm: json2.skus[0].measures.height || 20,
                widthCm: json2.skus[0].measures.width || 20,
                thicknessCm: json2.skus[0].measures.length || 5,
                weightGrams: json2.skus[0].measures.weight || 200,

                language: langsMap[book.Idioma[0].toLowerCase()],
                mainImgUrl: book.items[0].images[0].imageUrl,

                publisherId: book.Editora[0]
                    .split(" ")
                    .map((s) => _.capitalize(s.toLowerCase()))
                    .filter((s, i, arr) => !(i === arr.length - 1 && s === "Br"))
                    .join(" ")
                    .trim()
                    .replaceAll("  ", " "),

                mainAuthorId: book.Colaborador[0]
                    .split("|")
                    .find((c) => c.startsWith("Autor:"))
                    .replace("Autor:", "")
                    .split(", ")
                    .reverse()
                    .map((s) =>
                        s
                            .split(" ")
                            .map((subS) => (subS.endsWith(".") ? subS : _.capitalize(subS.toLowerCase())))
                            .join(" "),
                    )
                    .join(" ")
                    .trim()
                    .replace("J R.r", "J.R.R.")
                    .replaceAll("  ", " "),

                mainTranslatorId: book.Colaborador[0]
                    .split("|")
                    .find((c) => c.startsWith("Tradutor:"))
                    ?.replace("Tradutor:", "")
                    .split(", ")
                    .reverse()
                    .map((s) =>
                        s
                            .split(" ")
                            .map((subS) => (subS.endsWith(".") ? subS : _.capitalize(subS.toLowerCase())))
                            .join(" "),
                    )
                    .join(" ")
                    .trim()
                    .replaceAll("  ", " "),
            }

            booksContents.push(bookContent)
        }

        fs.writeFileSync(
            path.resolve(`./node-scripts/livraria-cultura/dump/livros-categoria-${categoryConfig.category}-${categoryConfig.subCategory}.json`),
            JSON.stringify(booksContents),
        )
    }
}

main().catch((error) => console.error(error))

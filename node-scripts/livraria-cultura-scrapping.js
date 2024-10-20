/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import fs from "fs"
import _ from "lodash"
import path from "path"

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
    const result = await fetch("https://www.livrariacultura.com.br/api/catalog_system/pub/products/search/?fq=productId:10025605")

    const json1 = await result.json()

    const json2 = await fetchJSON2(json1[0].link)

    fs.writeFileSync(path.resolve("./node-scripts/raw2.json"), JSON.stringify({ json1, json2 }))

    const fileContent = {
        price: json1[0].items[0].sellers[0].commertialOffer.ListPrice,
        stock: 10,
        title: json1[0].productName,
        description: json1[0].description,
        pages: Number(json1[0]["Páginas"][0]),
        publicationDate: json1[0].releaseDate,
        isbn10Code: json1[0].ISBN[0],
        isbn13Code: json1[0].items[0].ean,
        edition: Number(json1[0]["Edição"][0]),

        heightCm: json2.skus[0].measures.height,
        widthCm: json2.skus[0].measures.width,
        thicknessCm: json2.skus[0].measures.length,
        weightGrams: json2.skus[0].measures.weight,

        language: langsMap[json1[0].Idioma[0].toLowerCase()],
        mainImgUrl: json1[0].items[0].images[0].imageUrl,

        publisherId: json1[0].Editora[0]
            .split(" ")
            .map((s) => _.capitalize(s.toLowerCase()))
            .filter((s, i, arr) => !(i === arr.length - 1 && s === "Br"))
            .join(" "),

        mainAuthorId: json1[0].Colaborador[0]
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
            .join(" "),

        mainTranslatorId: json1[0].Colaborador[0]
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
            .join(" "),

        mainCategoryId: json1[0].categories[0]
            .replace("/Livros/", "")
            .split("/")
            .filter((s) => s.length > 0)
            .join("->"),
    }

    fs.writeFileSync(path.resolve("./node-scripts/livro2.json"), JSON.stringify(fileContent))
}

main().catch((error) => console.error(error))

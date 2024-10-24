import fs from "fs"
import _ from "lodash"
import path from "path"

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

/**@type {Record<string, string>} */
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
    const categoriesConfigFile = fs.readFileSync(path.resolve("./node-scripts/livraria-cultura/dump/categories.json")).toString()

    const categoriesConfig = JSON.parse(categoriesConfigFile)

    for (const categoryConfig of categoriesConfig) {
        console.log(`READING CATEGORY ${categoryConfig.category}"...`)

        const result = await fetch(categoryConfig.searchUrl)

        const json1 = await result.json()

        if (!json1 || json1.length === 0 || !Array.isArray(json1)) {
            console.log("SKIPED CATEGORY")
            continue
        }

        const readBookData = async (
            /**
             * @type {{
             * productName?: string;
             * Edição?: string[];
             * Páginas?: string[];
             * Idioma?: string[];
             * ISBN?: string[];
             * Editora?: string[];
             * Colaborador?: string[];
             * link?: string;
             * items?: {
             *      ean?: string
             *      images?: {
             *          imageUrl?: string;
             *      }[];
             *      sellers?: {
             *          commertialOffer?: {
             *              ListPrice?: number
             *          }
             *      }[]
             * }[];
             * description?: string;
             * releaseDate?: string;
             * }}
             * */ book,
        ) => {
            try {
                console.log(`READING "${book.productName}"...`)

                if (
                    !book.Páginas?.[0] ||
                    !book.Edição?.[0] ||
                    !book.Idioma?.[0] ||
                    !book.items?.[0]?.sellers?.[0] ||
                    !book.items[0].images?.[0] ||
                    !book.Editora?.[0] ||
                    !book.items[0].sellers[0].commertialOffer ||
                    !book.productName ||
                    !book.ISBN?.[0] ||
                    !book.Colaborador?.[0]
                ) {
                    console.log(`SKIPED BOOK ${book.productName}`)
                    return null
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
                    pages: Number(book.Páginas[0][0]),
                    publicationDate: book.releaseDate,
                    isbn10Code: book.ISBN[0],
                    isbn13Code: book.items[0].ean,
                    edition: Number(book.Edição[0]),

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
                        ?.replace("Autor:", "")
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

                return bookContent
            } catch (error) {
                console.error("ERROR AT BOOK", book.productName, error)
                return null
            }
        }

        const booksContents = await Promise.all(json1.map(readBookData))

        fs.writeFileSync(
            path.resolve(
                `./node-scripts/livraria-cultura/dump/livros-categoria____${categoryConfig.category.replaceAll("/", "__&__")}____${categoryConfig.subCategory.replaceAll("/", "__&__")}.json`,
            ),
            JSON.stringify(booksContents),
        )
    }
}

main().catch((error) => console.error(error))

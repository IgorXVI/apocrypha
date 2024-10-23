import fs from "fs"
import _ from "lodash"
import { db } from "../db"
import path from "path"

const main = async () => {
    const categories = await db.superCategory.findMany({
        include: {
            Category: true,
        },
    })
    /**
     * @type {{fetchURL: string; category: string; subCategory: string; searchUrl: string}[]}
     */
    let categoriesConfigFileContent = []

    try {
        for (const DBSuperCategory of categories) {
            const category = DBSuperCategory.name
            const categoryUrlName = _.kebabCase(category)

            const mainFetchURL = `https://www.livrariacultura.com.br/livros/${categoryUrlName}`

            console.log(`FETCHING MAIN "${mainFetchURL}"...`)

            const getSubCategoryInfos = async (/** @type {{ name: string; }} */ DBCategory) => {
                const subCategory = DBCategory.name
                const subCategoryUrlName = _.kebabCase(subCategory)

                const fetchURL = `https://www.livrariacultura.com.br/livros/${categoryUrlName}/${subCategoryUrlName}?O=OrderByTopSaleDESC&PS=24`

                console.log(`FETCHING "${fetchURL}"...`)

                const result = await fetch(fetchURL)

                const rawBody = await result.text()

                const fileContent = rawBody.split(`vtex.events.addData(`)[1]?.split(`);`)[0]

                /**@type {{shelfProductIds: string[]}} */
                const productIdsRaw = JSON.parse(fileContent ?? "")

                const productIds = productIdsRaw.shelfProductIds.map((id) => `fq=productId:${id}`).join("&")

                const searchUrl = `https://www.livrariacultura.com.br/api/catalog_system/pub/products/search/?${productIds}`

                return {
                    fetchURL,
                    category,
                    subCategory,
                    searchUrl,
                }
            }

            const results = await Promise.all(DBSuperCategory.Category.map(getSubCategoryInfos))

            categoriesConfigFileContent = categoriesConfigFileContent.concat(results)
        }
    } catch (error) {
        console.error("LOOP ERROR:", error)
    }

    fs.writeFileSync(path.resolve("./node-scripts/livraria-cultura/dump/categories.json"), JSON.stringify(categoriesConfigFileContent))
}

main().catch((error) => console.error(error))

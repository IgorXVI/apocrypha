/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import fs from "fs"
import _ from "lodash"
import path from "path"

import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient } from "@prisma/client"

neonConfig.webSocketConstructor = ws
const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const db = new PrismaClient({ adapter })

const main = async () => {
    const categories = await db.superCategory.findMany({
        include: {
            Category: true,
        },
    })

    let categoriesConfigFileContent = []

    try {
        for (const DBSuperCategory of categories) {
            const category = DBSuperCategory.name
            const categoryUrlName = _.kebabCase(category)

            const mainFetchURL = `https://www.livrariacultura.com.br/livros/${categoryUrlName}`

            console.log(`FETCHING MAIN "${mainFetchURL}"...`)

            const getSubCategoryInfos = async (DBCategory) => {
                const subCategory = DBCategory.name
                const subCategoryUrlName = _.kebabCase(subCategory)

                const fetchURL = `https://www.livrariacultura.com.br/livros/${categoryUrlName}/${subCategoryUrlName}?O=OrderByTopSaleDESC&PS=24`

                console.log(`FETCHING "${fetchURL}"...`)

                const result = await fetch(fetchURL)

                const rawBody = await result.text()

                const fileContent = rawBody.split(`vtex.events.addData(`)[1]?.split(`);`)[0]

                const productIds = JSON.parse(fileContent ?? "")
                    .shelfProductIds.map((id) => `fq=productId:${id}`)
                    .join("&")

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

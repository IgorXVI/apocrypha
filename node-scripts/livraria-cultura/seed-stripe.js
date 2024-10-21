import fs from "fs"
import path from "path"

import Stripe from "stripe"
import dotenv from "dotenv"

dotenv.config()

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-06-20",
})

const main = async () => {
    const fileContent = fs.readFileSync(path.resolve("./node-scripts/livraria-cultura/main-dump/new-books-cloud-imgs.json"))

    /** @type {{ mainImgUrl: string; price: number; title: string; stripeId?: string }[]} */
    const fileJSON = JSON.parse(fileContent.toString())

    /** @type {Stripe.Product[]} */
    let existingProducts = []

    while (true) {
        const newProducts = await stripe.products.list({
            limit: 100,
            starting_after: existingProducts.pop()?.id,
        })

        if (!newProducts.has_more) {
            break
        }

        existingProducts = existingProducts.concat(newProducts.data)
    }

    fileJSON.forEach((book) => {
        book.stripeId = existingProducts.find((p) => p.name === book.title)?.id
    })

    console.log(fileJSON[0])
    console.log(fileJSON[fileJSON.length - 1])

    fs.writeFileSync(path.resolve("./node-scripts/livraria-cultura/main-dump/new-books-stripe.json"), JSON.stringify(fileJSON))
}

main().catch((error) => console.error(error))

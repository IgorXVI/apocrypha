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
    let products = []

    /** @type {Promise<Stripe.Product>[]} */
    let promises = []

    for (const book of fileJSON) {
        if (promises.length > 10) {
            console.log("resolving stripe promises chunk")
            products = products.concat(await Promise.all(promises))
            promises = []
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }

        promises.push(
            stripe.products.create({
                name: book.title,
                images: [book.mainImgUrl],
                default_price_data: {
                    currency: "brl",
                    unit_amount: Math.ceil(book.price * 100),
                },
                shippable: true,
            }),
        )
    }

    fileJSON.forEach((book, i) => {
        book.stripeId = products[i]?.id
    })

    console.log(fileJSON[0])

    fs.writeFileSync(path.resolve("./node-scripts/livraria-cultura/main-dump/new-books-stripe.json"), JSON.stringify(fileJSON))
}

main().catch((error) => console.error(error))

import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"
import dotenv from "dotenv"

dotenv.config()

neonConfig.webSocketConstructor = ws
const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const db = new PrismaClient({ adapter })

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-06-20",
})

const s3Bucket = process.env.S3_IMG_BUCKET

const main = async () => {
    /**@type {Stripe.Product[]} */
    const allProducts = []

    let chunk = await stripe.products.list({
        limit: 100,
        active: true,
    })
    while (chunk.has_more) {
        allProducts.push(...chunk.data)

        chunk = await stripe.products.list({
            limit: 100,
            active: true,
            starting_after: chunk.data.at(-1)?.id,
        })
    }

    const allBooks = await db.book.findMany({
        select: {
            stripeId: true,
        },
        take: 9000,
    })

    /**@type {Record<string, boolean>} */
    const bookStripeIdMap = {}
    allBooks.forEach((book) => {
        bookStripeIdMap[book.stripeId] = true
    })

    /**@type {string[]} */
    const ghostProductIds = []

    /**@type {Stripe.Product[]} */
    const normalProducts = []

    allProducts.forEach((p) => {
        if (!bookStripeIdMap[p.id]) {
            ghostProductIds.push(p.id)
        } else if (s3Bucket && p.images.some((img) => img.includes(s3Bucket))) {
            normalProducts.push(p)
        }
    })

    if (ghostProductIds.length > 0) {
        console.log(`GHOST STRIPE PRODUCTS: ${ghostProductIds.length}`)

        /**@type {Promise<unknown>[]} */
        let promises = []

        for (const id of ghostProductIds) {
            if (promises.length > 10) {
                console.log("AWAITING STRIPE...")
                await Promise.all(promises)
                await new Promise((resolve) => setTimeout(resolve, 2000))
                promises = []
            }

            promises.push(
                stripe.products.update(id, {
                    active: false,
                }),
            )
        }

        if (promises.length > 0) {
            console.log("FiNAL AWAITING STRIPE...")
            await Promise.all(promises)
        }
    }

    if (normalProducts.length > 0) {
        console.log(`NORMAL STRIPE PRODUCTS: ${normalProducts.length}`)

        /**@type {Promise<unknown>[]} */
        let promises = []

        for (const product of normalProducts) {
            if (promises.length > 10) {
                console.log("AWAITING STRIPE...")
                await Promise.all(promises)
                await new Promise((resolve) => setTimeout(resolve, 2000))
                promises = []
            }

            promises.push(
                stripe.products.update(product.id, {
                    images: product.images.map((img) => img.replace(`${s3Bucket}.s3.amazonaws.com`, "d32155ei7f8k3w.cloudfront.net")),
                }),
            )
        }

        if (promises.length > 0) {
            console.log("FiNAL AWAITING STRIPE...")
            await Promise.all(promises)
        }
    }
}

main().catch((error) => console.error(error))

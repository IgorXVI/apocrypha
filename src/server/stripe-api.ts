import "server-only"

import Stripe from "stripe"

import { env } from "../env"
import { auth } from "@clerk/nextjs/server"
import { db } from "./db"
import { type SuperFreteShippingProduct } from "~/lib/types"
import { type Prisma } from "prisma/prisma-client"
import { calcShippingFee } from "./shipping-api"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
})

type ProductData = {
    name: string
    price: number
    mainImg: string
}

export const createProduct = async (productData: ProductData) => {
    const [product] = await Promise.allSettled([
        stripe.products.create({
            name: productData.name,
            images: [productData.mainImg],
            default_price_data: {
                currency: "brl",
                unit_amount: productData.price * 100,
            },
            shippable: true,
        }),
    ])

    if (product.status === "rejected") {
        return {
            success: false,
            message: `Failed to create product: ${product.reason}`,
            productId: "",
        }
    }

    return {
        success: true,
        message: "Product created successfully",
        productId: product.value.id,
    }
}

export const archiveProduct = async (stripeId: string) => {
    const [archivedProduct] = await Promise.allSettled([
        stripe.products.update(stripeId, {
            active: false,
        }),
    ])

    if (archivedProduct.status === "rejected") {
        return {
            success: false,
            message: `Failed to archive product with id "${stripeId}": ${archivedProduct.reason}`,
        }
    }

    return {
        success: true,
        message: `Product with id "${stripeId}" archived successfully`,
    }
}

export const restoreProduct = async (stripeId: string) => {
    const [archivedProduct] = await Promise.allSettled([
        stripe.products.update(stripeId, {
            active: true,
        }),
    ])

    if (archivedProduct.status === "rejected") {
        return {
            success: false,
            message: `Failed to restore product with id "${stripeId}": ${archivedProduct.reason}`,
        }
    }

    return {
        success: true,
        message: `Product with id "${stripeId}" restored successfully`,
    }
}

export const createCheckoutSession = async (products: { stripeId: string; quantity: number }[]) => {
    const user = auth()

    if (!user.userId) {
        return {
            success: false,
            message: `User is not authorized.`,
        }
    }

    const userAddress = await db.address.findUnique({
        where: {
            userId: user.userId,
        },
    })

    if (!userAddress) {
        return {
            success: false,
            message: `User has no address.`,
        }
    }

    const productQantityMap = new Map<string, number>()
    products.forEach((product) => {
        productQantityMap.set(product.stripeId, product.quantity)
    })

    const [stripeProducts] = await Promise.allSettled([
        stripe.products.list({
            ids: [...productQantityMap.keys()],
            limit: products.length,
        }),
    ])

    if (stripeProducts.status === "rejected") {
        return {
            success: false,
            message: `Failed to fetch products: ${stripeProducts.reason}`,
        }
    }

    const lineItems = stripeProducts.value.data.map((stripeProduct) => ({
        price: stripeProduct.default_price?.toString() ?? "",
        quantity: productQantityMap.get(stripeProduct.id),
    }))

    const books = await db.book.findMany({
        where: {
            stripeId: {
                in: products.map((p) => p.stripeId),
            },
        },
        select: {
            id: true,
            title: true,
            price: true,
            stripeId: true,
            weightGrams: true,
            widthCm: true,
            heightCm: true,
            thicknessCm: true,
        },
    })

    const booksMap = new Map<
        string,
        {
            id: string
            title: string
            price: Prisma.Decimal
            stripeId: string
            weightGrams: number
            widthCm: number
            heightCm: number
            thicknessCm: number
        }
    >()

    books.forEach((book) => {
        booksMap.set(book.stripeId, book)
    })

    const superFreteResult = await calcShippingFee({
        toPostalCode: userAddress.cep,
        products: stripeProducts.value.data.map((stripeProduct) => ({
            quantity: productQantityMap.get(stripeProduct.id)!,
            height: booksMap.get(stripeProduct.id)!.heightCm,
            width: booksMap.get(stripeProduct.id)!.widthCm,
            length: booksMap.get(stripeProduct.id)!.thicknessCm,
            weight: (booksMap.get(stripeProduct.id)!.weightGrams ?? 0) / 1000,
        })),
    })

    const [checkoutSession] = await Promise.allSettled([
        stripe.checkout.sessions.create({
            mode: "payment",
            currency: "brl",
            line_items: lineItems,
            success_url: `${env.URL}/commerce/payment-success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.URL}/commerce/payment-canceled/{CHECKOUT_SESSION_ID}`,
            locale: "pt-BR",
            shipping_options: superFreteResult.map((el) => ({
                shipping_rate_data: {
                    type: "fixed_amount",
                    metadata: {
                        serviceId: el.id,
                    },
                    display_name: el.name,
                    delivery_estimate: {
                        minimum: {
                            unit: "business_day",
                            value: el.delivery_range.min,
                        },
                        maximum: {
                            unit: "business_day",
                            value: el.delivery_range.max,
                        },
                    },
                    fixed_amount: {
                        amount: Math.ceil(el.price * 100),
                        currency: "brl",
                    },
                },
            })),
        }),
    ])

    if (checkoutSession.status === "rejected") {
        return {
            success: false,
            message: `Failed to create checkout session: ${checkoutSession.reason}`,
        }
    }

    const productsForOrderShipping: SuperFreteShippingProduct[] = products.map((product) => ({
        bookDBId: booksMap.get(product.stripeId)?.id ?? "N/A",
        name: booksMap.get(product.stripeId)?.title ?? "N/A",
        quantity: product.quantity,
        unitary_value: booksMap.get(product.stripeId)?.price.toNumber() ?? 0,
    }))

    await db.orderShipping.create({
        data: {
            sessionId: checkoutSession.value.id,
            shippingMethods: superFreteResult,
            products: productsForOrderShipping,
        },
    })

    return {
        success: true,
        message: "Checkout session created successfully",
        url: checkoutSession.value.url,
    }
}

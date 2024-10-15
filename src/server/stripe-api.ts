import "server-only"

import Stripe from "stripe"

import { env } from "../env"
import { auth } from "@clerk/nextjs/server"
import { db } from "./db"
import { type Prisma } from "prisma/prisma-client"
import { calcShippingFee, type CalcShippingFeePackage, type CreateShippingTicketProduct } from "./shipping-api"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
})

type ProductData = {
    name: string
    price: number
    mainImg: string
}

export type ShippingPackageData = {
    id: string
    packages: CalcShippingFeePackage[]
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

export const createCheckoutSession = async (inputProducts: { stripeId: string; quantity: number }[]) => {
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

    const books = await db.book.findMany({
        where: {
            stripeId: {
                in: inputProducts.map((p) => p.stripeId),
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
            stock: true,
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
            stock: number
        }
    >()

    books.forEach((book) => {
        booksMap.set(book.stripeId, book)
    })

    const products = inputProducts.filter((p) => {
        const bookInfo = booksMap.get(p.stripeId)

        if (!bookInfo || bookInfo.stock < p.quantity) {
            return false
        }

        return true
    })

    if (products.length === 0) {
        return {
            success: false,
            message: "No valid products.",
        }
    }

    const productQuantityMap = new Map<string, number>()
    products.forEach((product) => {
        productQuantityMap.set(product.stripeId, product.quantity)
    })

    const [stripeProducts] = await Promise.allSettled([
        stripe.products.list({
            ids: [...productQuantityMap.keys()],
            limit: products.length,
        }),
    ])

    if (stripeProducts.status === "rejected") {
        return {
            success: false,
            message: `Failed to fetch products: ${stripeProducts.reason}`,
        }
    }

    const lineItems = stripeProducts.value.data.map((sp) => ({
        price: sp.default_price?.toString() ?? "",
        quantity: productQuantityMap.get(sp.id),
    }))

    const shippingOptions = await calcShippingFee({
        toPostalCode: userAddress.cep,
        products: stripeProducts.value.data.map((sp) => ({
            quantity: productQuantityMap.get(sp.id)!,
            height: booksMap.get(sp.id)!.heightCm,
            width: booksMap.get(sp.id)!.widthCm,
            length: booksMap.get(sp.id)!.thicknessCm,
            weight: (booksMap.get(sp.id)!.weightGrams ?? 0) / 1000,
        })),
    }).catch((error) => {
        console.error("SHIPPING_OPTIONS_ERROR", error)
        return undefined
    })

    if (!shippingOptions) {
        throw new Error("Not able to fetch shipping prices.")
    }

    const [checkoutSession] = await Promise.allSettled([
        stripe.checkout.sessions.create({
            mode: "payment",
            currency: "brl",
            line_items: lineItems,
            success_url: `${env.URL}/commerce/payment-success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.URL}/commerce/payment-canceled/{CHECKOUT_SESSION_ID}`,
            locale: "pt-BR",
            shipping_options: shippingOptions.map((shipping) => ({
                shipping_rate_data: {
                    type: "fixed_amount",
                    metadata: {
                        serviceId: shipping.id,
                    },
                    display_name: shipping.name,
                    delivery_estimate: {
                        minimum: {
                            unit: "business_day",
                            value: shipping.delivery_range.min,
                        },
                        maximum: {
                            unit: "business_day",
                            value: shipping.delivery_range.max,
                        },
                    },
                    fixed_amount: {
                        amount: Math.ceil(shipping.price * 100),
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

    const productsForTicket: CreateShippingTicketProduct[] = products.map((product) => ({
        bookDBId: booksMap.get(product.stripeId)?.id ?? "N/A",
        name: booksMap.get(product.stripeId)?.title ?? "N/A",
        quantity: product.quantity,
        unitary_value: booksMap.get(product.stripeId)?.price.toNumber() ?? 0,
    }))

    const shippingPackages: ShippingPackageData[] = shippingOptions.map((shipping) => ({
        id: shipping.id.toString(),
        packages: shipping.packages,
    }))

    await db.checkoutSessionStore.create({
        data: {
            sessionId: checkoutSession.value.id,
            products: productsForTicket,
            shippingPackages: shippingPackages,
        },
    })

    return {
        success: true,
        message: "Checkout session created successfully",
        url: checkoutSession.value.url,
    }
}

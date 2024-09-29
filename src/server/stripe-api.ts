"server-only"

import Stripe from "stripe"

import { env } from "../env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
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

    const [checkoutSession] = await Promise.allSettled([
        stripe.checkout.sessions.create({
            mode: "payment",
            currency: "brl",
            line_items: lineItems,
            success_url: `${env.URL}/commerce/payment-success`,
            cancel_url: `${env.URL}/commerce/payment-canceled`,
        }),
    ])

    if (checkoutSession.status === "rejected") {
        return {
            success: false,
            message: `Failed to create checkout session: ${checkoutSession.reason}`,
        }
    }

    return {
        success: true,
        message: "Checkout session created successfully",
        url: checkoutSession.value.url,
    }
}

export const getProductPrice = async (stripeId: string) => {
    const [product] = await Promise.allSettled([stripe.products.retrieve(stripeId)])

    if (product.status === "rejected") {
        return {
            success: false,
            message: `Failed to fetch product: ${product.reason}`,
        }
    }

    const [price] = await Promise.allSettled([stripe.prices.retrieve(product.value.default_price?.toString() ?? "")])

    if (price.status === "rejected") {
        return {
            success: false,
            message: `Failed to fetch price: ${price.reason}`,
        }
    }

    return {
        success: true,
        message: "Price fetched successfully",
        price: price.value.unit_amount ? price.value.unit_amount / 100 : 0,
    }
}

export const getProductsPricesMap = async (stripeIds: string[]) => {
    const [products] = await Promise.allSettled([
        stripe.products.list({
            ids: stripeIds,
            limit: stripeIds.length,
        }),
    ])

    if (products.status === "rejected") {
        return {
            success: false,
            message: `Failed to fetch products: ${products.reason}`,
        }
    }

    const prices = await Promise.allSettled(products.value.data.map((product) => stripe.prices.retrieve(product.default_price?.toString() ?? "")))

    const pricesWithErrors = prices.filter((price) => price.status === "rejected")

    if (pricesWithErrors.length > 0) {
        return {
            success: false,
            message: `Failed to fetch prices: ${pricesWithErrors.map((price) => `${price.reason}`).join(", ")}`,
        }
    }

    const priceIdsToProductIdsMap = new Map<string, string>()
    products.value.data.forEach((product) => {
        priceIdsToProductIdsMap.set(product.default_price?.toString() ?? "", product.id)
    })

    const pricesMap = new Map<string, number>()
    prices.forEach((price) => {
        if (price.status === "fulfilled") {
            pricesMap.set(priceIdsToProductIdsMap.get(price.value.id) ?? "", price.value.unit_amount ? price.value.unit_amount / 100 : 0)
        }
    })

    return {
        success: true,
        message: "Prices fetched successfully",
        pricesMap,
    }
}

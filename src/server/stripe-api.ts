import "server-only"

import Stripe from "stripe"

import { env } from "../env"
import { auth } from "@clerk/nextjs/server"
import { db } from "./db"
import { type Prisma } from "prisma/prisma-client"
import { calcShippingFee, createShippingTicket, type CalcShippingFeePackage, type CreateShippingTicketProduct } from "./shipping-api"
import { authClient } from "./auth-api"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
})

type ProductData = {
    name: string
    price: number
    mainImg: string
}

type ProductDataUpdate = {
    name?: string
    price?: number
    mainImg?: string
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
                unit_amount: Math.ceil(productData.price * 100),
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

export const updateProduct = async (stripeId: string, productData: ProductDataUpdate) => {
    let newPriceId: string | undefined
    if (productData.price) {
        const [priceResult] = await Promise.allSettled([
            stripe.prices.create({
                currency: "brl",
                unit_amount: Math.ceil(productData.price * 100),
                product: stripeId,
            }),
        ])

        if (priceResult.status === "rejected") {
            return {
                success: false,
                message: `Failed to update price: ${priceResult.reason}`,
            }
        }

        newPriceId = priceResult.value.id
    }

    const [product] = await Promise.allSettled([
        stripe.products.update(stripeId, {
            name: productData.name ? productData.name : undefined,
            images: productData.mainImg ? [productData.mainImg] : undefined,
            default_price: newPriceId,
        }),
    ])

    if (product.status === "rejected") {
        return {
            success: false,
            message: `Failed to update product: ${product.reason}`,
        }
    }

    return {
        success: true,
        message: "Product updated successfully",
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
        take: 300,
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

    const newOrder = await db
        .$transaction(async (transaction) => {
            await transaction.checkoutSessionStore.create({
                data: {
                    sessionId: checkoutSession.value.id,
                    products: productsForTicket,
                    shippingPackages: shippingPackages,
                },
            })

            const result = await transaction.order.create({
                data: {
                    userId: user.userId,
                    sessionId: checkoutSession.value.id,
                },
            })

            return result
        })
        .catch((error) => {
            console.error("ERROR_WHEN_TRYING_TO_CREATE_ORDER:", error)
            return undefined
        })

    if (!newOrder) {
        return {
            success: false,
            message: "Not able to create order.",
        }
    }

    return {
        success: true,
        message: "Checkout session created successfully",
        url: checkoutSession.value.url,
    }
}

export const handleChekoutConfirmation = async (session: Stripe.Checkout.Session) => {
    let globalPaymentId: string | undefined
    let globalRefund: Stripe.Refund | undefined
    let globalOrderId: string | undefined
    try {
        const sessionId = session.id

        const order = await db.order.findUnique({
            where: {
                sessionId,
            },
        })

        if (!order) {
            throw new Error("Order not found.")
        }

        globalOrderId = order.id

        const eventPayment = session.payment_intent

        if (!eventPayment) {
            throw new Error("Payment ID not found.")
        }

        const paymentId = typeof eventPayment === "string" ? eventPayment : eventPayment.id
        globalPaymentId = paymentId

        const refund = await stripe.refunds
            .list({
                payment_intent: globalPaymentId,
            })
            .then((res) => res.data[0])

        if (refund) {
            globalRefund = refund
            throw new Error("Payment already refunded.")
        }

        const stripeShipping = await stripe.shippingRates.retrieve(session.shipping_cost?.shipping_rate?.toString() ?? "")

        if (!stripeShipping) {
            throw new Error("Shipping data nout found")
        }

        const userAddress = await db.address.findUnique({
            where: {
                userId: order.userId,
            },
        })

        if (!userAddress) {
            throw new Error("User address data nout found")
        }

        const checkoutSessionStore = await db.checkoutSessionStore.findUnique({
            where: {
                sessionId,
            },
        })

        if (!checkoutSessionStore) {
            throw new Error("Product data nout found")
        }

        const productsForTicket: CreateShippingTicketProduct[] = checkoutSessionStore.products.map((p) => p?.valueOf() as CreateShippingTicketProduct)

        const allShippingPackages: ShippingPackageData[] = checkoutSessionStore.shippingPackages.map((sp) => sp?.valueOf() as ShippingPackageData)
        const shippingPackages: CalcShippingFeePackage[] =
            allShippingPackages.find((sp) => sp.id === (stripeShipping.metadata.serviceId ?? ""))?.packages ?? []

        const fristPackage = shippingPackages[0]

        if (!fristPackage) {
            throw new Error("Shipping package size data nout found")
        }

        const userData = await authClient.users.getUser(order.userId)

        const ticketRes = await createShippingTicket({
            to: {
                name: `${userData.firstName} ${userData.lastName}`,
                address: `${userAddress.street}, número ${userAddress.number}${userAddress.complement ? `, ${userAddress.complement}` : ""}`,
                district: userAddress.neighborhood,
                city: userAddress.city,
                state_abbr: userAddress.state,
                postal_code: userAddress.cep,
                email: userData.primaryEmailAddress?.emailAddress ?? "N/A",
            },
            service: Number(stripeShipping.metadata.serviceId) ?? 0,
            products: productsForTicket,
            volumes: {
                weight: fristPackage.weight,
                height: fristPackage.dimensions.height,
                length: fristPackage.dimensions.length,
                width: fristPackage.dimensions.width,
            },
            tag: JSON.stringify({ sessionId: session.id, userId: order.userId }),
        })

        await db.$transaction(async (transaction) => {
            const books = await transaction.book.findMany({
                where: {
                    id: {
                        in: productsForTicket.map((p) => p.bookDBId),
                    },
                },
                select: {
                    id: true,
                    stock: true,
                },
            })

            const updateManyBooks: {
                data: {
                    stock: number
                }
                where: {
                    id: string
                }
            }[] = []

            productsForTicket.forEach((p) => {
                const book = books.find((b) => b.id === p.bookDBId)

                if (!book || book.stock < p.quantity) {
                    throw new Error(`Book "${p.name}" is out of stock.`)
                }

                updateManyBooks.push({
                    data: {
                        stock: book.stock - p.quantity,
                    },
                    where: {
                        id: book.id,
                    },
                })
            })

            const updateResults = await Promise.allSettled(updateManyBooks.map((u) => transaction.book.update(u)))

            updateResults.forEach((ur) => {
                if (ur.status === "rejected") {
                    throw ur.reason
                }
            })

            await transaction.bookOnOrder.createMany({
                data: productsForTicket.map((p) => ({
                    bookId: p.bookDBId,
                    orderId: order.id,
                    price: p.unitary_value,
                    amount: p.quantity,
                })),
            })

            await transaction.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: "PREPARING",
                    updatedAt: new Date(),
                    paymentId,
                    ticketId: ticketRes.id,
                    totalPrice: session.amount_total! / 100,
                    shippingPrice: session.shipping_cost!.amount_total / 100,
                    shippingServiceId: stripeShipping.metadata.serviceId!,
                    shippingServiceName: stripeShipping.display_name!,
                    shippingDaysMin: stripeShipping.delivery_estimate!.minimum!.value,
                    shippingDaysMax: stripeShipping.delivery_estimate!.maximum!.value,
                },
            })

            await transaction.checkoutSessionStore.delete({
                where: {
                    sessionId,
                },
            })
        })

        return {
            success: true,
        }
    } catch (error) {
        const commonErrorResponse = {
            success: false,
            errorMessage: "Error during the execution of the confirmation procedure.",
        }
        try {
            const getErrorStr = (e: unknown) => (e instanceof Error ? e.message : JSON.stringify(e || "NULL"))

            const mainErrorStr = getErrorStr(error)

            console.error("STRIPE_HANDLE_CONFIRMATION_ERROR:", mainErrorStr)

            if (!globalOrderId) {
                return commonErrorResponse
            }

            await db.order.update({
                where: {
                    id: globalOrderId,
                },
                data: {
                    paymentId: globalPaymentId,
                    updatedAt: new Date(),
                    status: "CANCELED",
                    cancelReason: "EXCEPTION",
                    cancelMessage: mainErrorStr,
                },
            })

            if (!globalPaymentId) {
                return commonErrorResponse
            }

            let refund = globalRefund

            if (!refund) {
                refund = await stripe.refunds
                    .list({
                        payment_intent: globalPaymentId,
                    })
                    .then((res) => res.data[0])
            }

            if (!refund) {
                refund = await stripe.refunds.create({
                    payment_intent: globalPaymentId,
                })
            }

            if (refund.status !== "succeeded" && refund.status !== "pending") {
                console.error(
                    "STRIPE_HANDLE_CONFIRMATION_ERROR_DURING_REFUND:",
                    `Error when trying to make stripe refund, returned status: ${refund.status}, payment ID: ${globalPaymentId}`,
                )
                return commonErrorResponse
            }

            return commonErrorResponse
        } catch (stripeError) {
            console.error("STRIPE_HANDLE_CONFIRMATION_ERROR_AFTER_REFUND:", stripeError)

            return commonErrorResponse
        }
    }
}

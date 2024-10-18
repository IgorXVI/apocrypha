"use server"

import { revalidatePath } from "next/cache"
import { db } from "../db"
import { cancelTicket, emitTicket, getProductInfo } from "../shipping-api"
import { handleChekoutConfirmation, stripe } from "../stripe-api"
import { type Prisma } from "prisma/prisma-client"

const validateOrderStatus = (order: Prisma.OrderGetPayload<Prisma.OrderDefaultArgs>) => {
    if (order.status === "AWAITING_CONFIRMATION") {
        return {
            success: false,
            errorMessage: "Pagamento do pedido ainda não foi confirmado pelo Stripe.",
        }
    }

    if (order.status === "CANCELED") {
        return {
            success: false,
            errorMessage: "Pedido está cancelado.",
        }
    }

    return {
        success: true,
    }
}

export const emitOrderTicket = async (id: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "ID deve ser uma string.",
        }
    }

    const order = await db.order.findUnique({
        where: {
            id,
        },
    })

    if (!order) {
        return {
            success: false,
            errorMessage: "Pedido não foi encontrado.",
        }
    }

    const validResult = validateOrderStatus(order)
    if (!validResult.success) {
        return validResult
    }

    if (!order.ticketId) {
        return {
            success: false,
            errorMessage: "Pedido não possui ticket.",
        }
    }

    const ticketEmitedResult = await emitTicket(order.ticketId).catch((error) => {
        console.error("EMIT_TICKET_ON_ADMIN_ERROR", error)
        return undefined
    })

    if (typeof ticketEmitedResult === "string") {
        return {
            success: false,
            errorMessage: `Mensagem do Super Frete: ${ticketEmitedResult}`,
        }
    }

    if (!ticketEmitedResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao tentar emitir o ticket.",
        }
    }

    const updateResult = await db.order
        .update({
            where: {
                id,
            },
            data: {
                printUrl: ticketEmitedResult.printUrl,
                updatedAt: new Date(),
            },
        })
        .catch((error) => {
            console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
            return undefined
        })

    if (!updateResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao atualizar o pedido.",
        }
    }

    revalidatePath("/admin")

    return {
        success: true,
    }
}

export const inferNewOrderStatus = async (id: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "ID deve ser uma string.",
        }
    }

    const order = await db.order.findUnique({
        where: {
            id,
        },
    })

    if (!order) {
        return {
            success: false,
            errorMessage: "Pedido não foi encontrado.",
        }
    }

    const validResult = validateOrderStatus(order)
    if (!validResult.success) {
        return validResult
    }

    if (!order.ticketId) {
        return {
            success: false,
            errorMessage: "Pedido não possui ticket.",
        }
    }

    const ticketInfo = await getProductInfo(order.ticketId).catch((error) => {
        console.error("GET_TICKET_INFO_ON_ADMIN_ERROR", error)
        return undefined
    })

    if (!ticketInfo) {
        return {
            success: false,
            errorMessage: "Não foi possível buscar as informações do ticket no Super Frete.",
        }
    }

    const updateResult = await db.order
        .update({
            where: {
                id,
            },
            data: {
                tracking: ticketInfo.tracking,
                status: ticketInfo.status && ticketInfo.tracking ? "IN_TRANSIT" : "PREPARING",
                updatedAt: new Date(),
            },
        })
        .catch((error) => {
            console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
            return undefined
        })

    if (!updateResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao atualizar o pedido.",
        }
    }

    revalidatePath("/admin")

    return {
        success: true,
    }
}

export const cancelOrder = async (id: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "ID deve ser uma string.",
        }
    }

    const order = await db.order.findUnique({
        where: {
            id,
        },
    })

    if (!order) {
        return {
            success: false,
            errorMessage: "Pedido não foi encontrado.",
        }
    }

    const validResult = validateOrderStatus(order)
    if (!validResult.success) {
        return validResult
    }

    if (!order.paymentId) {
        return {
            success: false,
            errorMessage: "Pedido não possui ID de pagamento.",
        }
    }

    let stripeRefundResult = await stripe.refunds
        .list({
            payment_intent: order.paymentId,
        })
        .then((res) => res.data[0])

    if (!stripeRefundResult) {
        stripeRefundResult = await stripe.refunds
            .create({
                payment_intent: order.paymentId,
            })
            .catch((error) => {
                console.error("CREATE_STRIPE_REFUND_ON_ADMIN_ERROR", error)
                return undefined
            })
    }

    if (!stripeRefundResult) {
        return {
            success: false,
            errorMessage: "Erro ao tentar criar o reembolso no stripe.",
        }
    }

    if (stripeRefundResult.status !== "pending" && stripeRefundResult.status !== "succeeded") {
        return {
            success: false,
            errorMessage: `Erro ao tentar criar o reembolso no stripe, status retornado: ${stripeRefundResult.status}`,
        }
    }

    if (!order.ticketId) {
        return {
            success: false,
            errorMessage: "Pedido não possui ticket.",
        }
    }

    const ticketInfo = await cancelTicket(order.ticketId).catch((error) => {
        console.error("GET_TICKET_INFO_ON_ADMIN_ERROR", error)
        return "ERRO"
    })

    if (typeof ticketInfo === "string") {
        return {
            success: false,
            errorMessage: "Não foi possível cancelar o ticket no Super Frete.",
        }
    }

    const transactionResult = await db
        .$transaction(async (transaction) => {
            const booksOnOrder = await transaction.bookOnOrder.findMany({
                where: {
                    orderId: id,
                },
            })

            const booksStock = await transaction.book.findMany({
                where: {
                    id: {
                        in: booksOnOrder.map((bo) => bo.bookId),
                    },
                },
                select: {
                    id: true,
                    stock: true,
                },
            })

            const bookUpdates = await Promise.allSettled(
                booksStock.map((bs) =>
                    transaction.book.update({
                        where: {
                            id: bs.id,
                        },
                        data: {
                            stock: (booksOnOrder.find((bo) => bo.bookId === bs.id)?.amount ?? 0) + bs.stock,
                        },
                    }),
                ),
            )

            bookUpdates.forEach((bu) => {
                if (bu.status === "rejected") {
                    throw bu.reason
                }
            })

            await transaction.order.update({
                where: {
                    id,
                },
                data: {
                    status: "CANCELED",
                    cancelReason: "ADMIN",
                    updatedAt: new Date(),
                },
            })

            return true
        })
        .catch((error) => {
            console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
            return false
        })

    if (!transactionResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao atualizar o pedido.",
        }
    }

    revalidatePath("/admin")

    return {
        success: true,
    }
}

export const simulateOrderDone = async (id: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "ID deve ser uma string.",
        }
    }

    const order = await db.order.findUnique({
        where: {
            id,
        },
    })

    if (!order) {
        return {
            success: false,
            errorMessage: "Pedido não foi encontrado.",
        }
    }

    const validResult = validateOrderStatus(order)
    if (!validResult.success) {
        return validResult
    }

    const updateResult = await db.order
        .update({
            where: {
                id,
            },
            data: {
                status: order.status === "IN_TRANSIT" ? "DELIVERED" : order.status,
                updatedAt: new Date(),
            },
        })
        .catch((error) => {
            console.error("UPDATE_ORDER_ON_ADMIN_ERROR", error)
            return undefined
        })

    if (!updateResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao atualizar o pedido.",
        }
    }

    revalidatePath("/admin")

    return {
        success: true,
    }
}

export const simulateStripeConfirmation = async (id: unknown) => {
    if (typeof id !== "string") {
        return {
            success: false,
            errorMessage: "ID deve ser uma string.",
        }
    }

    const order = await db.order.findUnique({
        where: {
            id,
        },
    })

    if (!order) {
        return {
            success: false,
            errorMessage: "Pedido não foi encontrado.",
        }
    }

    if (order.status === "CANCELED") {
        return {
            success: false,
            errorMessage: "Pedido já foi cancelado.",
        }
    }

    if (order.status !== "AWAITING_CONFIRMATION") {
        return {
            success: false,
            errorMessage: "Pedido já foi confirmado pelo Stripe.",
        }
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(order.sessionId).catch((error) => {
        console.error("RETRIEVE_STRIPE_SESSION_ON_ADMIN_ERROR", error)
        return undefined
    })

    if (!stripeSession) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao tentar buscar a stripe session.",
        }
    }

    const confrimationResult = await handleChekoutConfirmation(stripeSession).catch((error) => {
        console.error("CHECKOUT_CONFIRMATION_ON_ADMIN_ERROR", error)
        return undefined
    })

    revalidatePath("/admin")

    if (!confrimationResult) {
        return {
            success: false,
            errorMessage: "Aconteceu um erro ao tentar simular a confirmação.",
        }
    }

    return {
        success: true,
    }
}

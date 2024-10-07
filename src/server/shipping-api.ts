import "server-only"

import { env } from "~/env"
import { type SuperFreteShippingProduct, type SuperFreteShipping } from "~/lib/types"

type CalcShippingFeeInput = {
    toPostalCode: string
    products: {
        quantity: number
        height: number
        width: number
        length: number
        weight: number
    }[]
}

export const calcShippingFee: (input: CalcShippingFeeInput) => Promise<SuperFreteShipping[]> = async (input) => {
    const result: SuperFreteShipping[] = await fetch(`${env.SUPER_FRETE_URL}/calculator`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.SUPER_FRETE_TOKEN}`,
            "User-Agent": env.APP_USER_AGENT,
            accept: "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            from: { postal_code: env.COMPANY_CEP },
            to: { postal_code: input.toPostalCode },
            services: "2,1,17",
            options: {
                own_hand: false,
                receipt: false,
                insurance_value: 0,
                use_insurance_value: false,
            },
            products: input.products,
        }),
    }).then((res) => res.json())

    return result
}

type CreateShippingTicketInput = {
    to: {
        name: string
        address: string
        district: string
        state_abbr: string
        postal_code: string
        city: string
        email: string
    }
    service: number
    products: SuperFreteShippingProduct[]
    volumes: {
        weight: string
        height: string
        width: string
        length: string
    }
    tag: string
}

export const createShippingTicket: (input: CreateShippingTicketInput) => Promise<string> = async (input) => {
    const shippingTicket = await fetch(`${env.SUPER_FRETE_URL}/cart`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.SUPER_FRETE_TOKEN}`,
            accept: "application/json",
            "User-Agent": env.APP_USER_AGENT,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            from: {
                name: env.COMPANY_NAME_FOR_ADDRESS,
                address: env.COMPANY_STREET,
                district: env.COMPANY_NEIGHBORHOOD,
                state_abbr: env.COMPANY_STATE,
                postal_code: env.COMPANY_CEP,
                city: env.COMPANY_CITY,
            },
            to: input.to,
            service: input.service,
            products: input.products,
            volumes: input.volumes,
            tag: input.tag,
            url: env.URL,
            platform: env.APP_NAME,
            options: {
                insurance_value: null,
                non_commercial: false,
            },
        }),
    }).then((response) => response.json())

    const result = shippingTicket.id as string

    return result
}

type EmitTicketFetchOrder = {
    id: string
    price: number
    discount: number
    service_id: number
    tracking: string
    print: {
        url: string
    }
}

type EmitTicketFetchOutput = {
    success?: boolean
    purchase: {
        status: string
        orders: [EmitTicketFetchOrder]
    }
}

type EmitTicketOutput = {
    orderId: string
    tracking: string
    printUrl: string
    price: number
}

export const emitTicket: (ticketId: string) => Promise<EmitTicketOutput | undefined> = async (ticketId) => {
    const shippingTicket: EmitTicketFetchOutput = await fetch(`${env.SUPER_FRETE_URL}/checkout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.SUPER_FRETE_TOKEN}`,
            accept: "application/json",
            "User-Agent": env.APP_USER_AGENT,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            orders: [ticketId],
        }),
    }).then((response) => response.json())

    if (!shippingTicket.success) {
        console.error("EMIT_TICKET_ERROR", JSON.stringify(shippingTicket, null, 2))
        return undefined
    }

    const orderData = shippingTicket.purchase.orders[0]

    return {
        orderId: orderData.id,
        tracking: orderData.tracking,
        printUrl: orderData.print.url,
        price: orderData.price,
    }
}

import "server-only"

import { env } from "~/env"

export type CalcShippingFeePackage = {
    price: number
    discount: string
    format: string
    dimensions: {
        height: string
        width: string
        length: string
    }
    weight: string
    insurance_value: number
}

export type CalcShippingFeeOutput = {
    id: number
    name: string
    price: number
    discount: string
    currency: string
    delivery_time: number
    delivery_range: {
        min: number
        max: number
    }
    packages: CalcShippingFeePackage[]
    has_error: boolean
}

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

export const calcShippingFee: (input: CalcShippingFeeInput) => Promise<CalcShippingFeeOutput[]> = async (input) => {
    const result: CalcShippingFeeOutput[] = await fetch(`${env.SUPER_FRETE_URL}/calculator`, {
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

export type CreateShippingTicketProduct = {
    bookDBId: string
    name: string
    quantity: number
    unitary_value: number
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
    products: CreateShippingTicketProduct[]
    volumes: {
        weight: string
        height: string
        width: string
        length: string
    }
    tag: string
}

type CreateShippingTicketOutput = {
    id: string
    status: string
}

export const createShippingTicket: (input: CreateShippingTicketInput) => Promise<CreateShippingTicketOutput> = async (input) => {
    const result: CreateShippingTicketOutput = await fetch(`${env.SUPER_FRETE_URL}/cart`, {
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
    error?: string
}

export type EmitTicketOutput = {
    ticketId: string
    tracking: string
    printUrl: string
    price: number
}

export const emitTicket: (ticketId: string) => Promise<EmitTicketOutput | undefined | string> = async (ticketId) => {
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
        return shippingTicket.error
    }

    const orderData = shippingTicket.purchase.orders[0]

    return {
        ticketId: orderData.id,
        tracking: orderData.tracking,
        printUrl: orderData.print.url,
        price: orderData.price,
    }
}

type GetProductInfoFetchOutput = {
    id: string
    format: string
    delivery: number
    delivery_min: number
    delivery_max: number
    discount: number
    height: number
    width: number
    length: number
    weight: number
    from: {
        address: string
        city: string
        complement: string
        district: string
        document: string
        name: string
        location_number: string
        postal_code: string
        state_abbr: string
        country_id: string
    }
    to: {
        address: string
        city: string
        complement: string
        district: string
        document: string
        name: string
        location_number: string
        postal_code: string
        state_abbr: string
        country_id: string
    }
    invoice: string
    own_hand: boolean
    receipt: boolean
    price: number
    tracking: string
    status: string
    service_id: string
    products: {
        name: string
        quantity: string
        unitary_value: string
    }[]
    insurance_value: string
    generated_at: string
    posted_at: string
    created_at: string
    updated_at: string
}

export type GetProductInfoOutput = {
    ticketId: string
    tracking: string
    status: string
    updatedAt: string
    price: number
}

export const getProductInfo: (ticketId: string) => Promise<GetProductInfoOutput> = async (ticketId) => {
    const info: GetProductInfoFetchOutput = await fetch(`${env.SUPER_FRETE_URL}/order/info/${ticketId}`, {
        headers: {
            Authorization: `Bearer ${env.SUPER_FRETE_TOKEN}`,
            accept: "application/json",
            "User-Agent": env.APP_USER_AGENT,
            "content-type": "application/json",
        },
    }).then((response) => response.json())

    return {
        ticketId,
        tracking: info.tracking,
        status: info.status,
        updatedAt: info.updated_at,
        price: info.price,
    }
}

export const cancelTicket = async (ticketId: string) => {
    await fetch(`${env.SUPER_FRETE_URL}/order/cancel`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.SUPER_FRETE_TOKEN}`,
            accept: "application/json",
            "User-Agent": env.APP_USER_AGENT,
            "content-type": "application/json",
        },
        body: JSON.stringify({ order: { id: ticketId } }),
    })
}

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

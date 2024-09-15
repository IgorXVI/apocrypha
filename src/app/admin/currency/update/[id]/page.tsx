"use client"

import { getOneCurrency, updateCurrency } from "~/server/queries"

import CreateOrUpdateCurrency from "../../_components/create-or-update-currency"

export default function UpdateCurrency({
    params: { id },
}: {
    params: { id: string }
}) {
    return (
        <CreateOrUpdateCurrency
            dbMutation={(values) => updateCurrency(id, values)}
            dbGetOne={() => getOneCurrency(id)}
        ></CreateOrUpdateCurrency>
    )
}

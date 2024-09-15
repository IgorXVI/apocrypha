"use client"

import { createCurrency } from "~/server/queries"

import CreateOrUpdateCurrency from "../_components/create-or-update-currency"

export default function CreateCurrency() {
    return (
        <CreateOrUpdateCurrency
            dbMutation={createCurrency}
        ></CreateOrUpdateCurrency>
    )
}

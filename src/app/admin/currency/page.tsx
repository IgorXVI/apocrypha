"use client"

import SearchPage from "~/app/admin/_components/search-page"

import { getManyCurrencies } from "~/server/queries"

export default function Currencies() {
    return (
        <SearchPage
            title="Moedas"
            description="Crie, atualize, apague ou busque moedas cadastradas"
            slug="currency"
            tableHeaders={["ID", "Prefixo", "Código"]}
            tableAttrs={["id", "label", "iso4217Code"]}
            defaultValues={{
                id: "",
                label: "",
                iso4217Code: "",
            }}
            getManyQuery={getManyCurrencies}
        ></SearchPage>
    )
}

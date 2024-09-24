import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

import SearchPage from "~/app/admin/_components/search-page"

import { currencyValidationSchema, type CurrencySchemaType } from "~/server/validation"

type ModelAttrs = keyof CurrencySchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
    }
> = {
    label: {
        node: (field) => (
            <Input
                placeholder="$"
                {...field}
            />
        ),
        label: "Prefixo",
        description: "Esse é o préfixo que vai aparecer antes do valor monetário.",
    },
    iso4217Code: {
        node: (field) => (
            <Input
                placeholder="EUR"
                {...field}
            />
        ),
        label: "Código ISO 4217",
        description: (
            <>
                Esse é o código
                <a
                    href="https://pt.wikipedia.org/wiki/ISO_4217"
                    className="underline mr-1 ml-1"
                >
                    ISO 4217
                </a>
                da moeda.
            </>
        ),
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="moeda"
            namePlural="moedas"
            tableHeaders={{
                id: "ID",
                label: "Prefixo",
                iso4217Code: "Código",
            }}
            slug="generic-crud/currency"
            inputKeyMap={inputKeyMap}
            formSchema={currencyValidationSchema}
        ></SearchPage>
    )
}

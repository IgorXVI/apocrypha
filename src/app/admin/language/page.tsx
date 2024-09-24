"use client"

import SearchPage from "~/app/admin/_components/search-page"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

import { languageValidationSchema, type LanguageSchemaType } from "~/server/validation"

type ModelAttrs = keyof LanguageSchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
    }
> = {
    name: {
        node: (field) => (
            <Input
                placeholder="Inglês"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da língua.",
    },
    iso6391Code: {
        node: (field) => (
            <Input
                placeholder="pt"
                {...field}
            />
        ),
        label: "Código ISO 6391",
        description: (
            <>
                Esse é o código
                <a
                    href="https://pt.wikipedia.org/wiki/ISO_6391"
                    className="underline mr-1 ml-1"
                >
                    ISO 6391
                </a>
                da moeda.
            </>
        ),
    },
    iso6392Code: {
        node: (field) => (
            <Input
                placeholder="eng"
                {...field}
            />
        ),
        label: "Código ISO 6392",
        description: (
            <>
                Esse é o código
                <a
                    href="https://pt.wikipedia.org/wiki/ISO_6392"
                    className="underline mr-1 ml-1"
                >
                    ISO 6392
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
                name: "Nome",
                iso6391Code: "Código ISO 6391",
                iso6392Code: "Código ISO 6392",
            }}
            slug="generic-crud/language"
            inputKeyMap={inputKeyMap}
            formSchema={languageValidationSchema}
        ></SearchPage>
    )
}

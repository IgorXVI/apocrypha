"use client"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

import SearchPage from "~/app/admin/_components/search-page"

import { seriesValidationSchema, type SeriesSchemaType } from "~/server/validation"

type ModelAttrs = keyof SeriesSchemaType

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
                placeholder="Senhor dos Anéis"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da Série.",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="série"
            namePlural="séries"
            tableHeaders={{
                id: "ID",
                name: "Nome",
            }}
            slug="generic-crud/series"
            inputKeyMap={inputKeyMap}
            formSchema={seriesValidationSchema}
        ></SearchPage>
    )
}

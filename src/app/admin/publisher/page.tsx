"use client"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import SearchPage from "~/app/admin/_components/search-page"

import { publisherValidationSchema, type PublisherSchemaType } from "~/lib/validation"

type ModelAttrs = keyof PublisherSchemaType

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
                placeholder="Editora Campos Sales"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da Editora.",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="editora"
            namePlural="editoras"
            tableHeaders={{
                id: "ID",
                name: "Nome",
            }}
            slug="generic-crud/publisher"
            inputKeyMap={inputKeyMap}
            formSchema={publisherValidationSchema}
        ></SearchPage>
    )
}

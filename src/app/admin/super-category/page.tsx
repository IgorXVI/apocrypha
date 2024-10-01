"use client"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

import SearchPage from "~/app/admin/_components/search-page"

import { superCategoryValidationSchema, type SuperCategorySchemaType } from "~/lib/validation"

type ModelAttrs = keyof SuperCategorySchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
        className?: string
    }
> = {
    iconSvg: {
        node: (field) => (
            <Input
                placeholder="SVG Code"
                {...field}
            ></Input>
        ),
        label: "Imagem do ícone da categoria.",
        description: "Escolha imagem para servir como ícone da categoria.",
        className: "admin-input-md-center",
    },
    name: {
        node: (field) => (
            <Input
                placeholder="Fanstasia"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da categoria.",
        className: "admin-input-md-center",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="categoria mãe"
            namePlural="categorias mães"
            tableHeaders={{
                id: "ID",
                iconSvg: "Icone",
                name: "Nome",
            }}
            slug="generic-crud/super-category"
            inputKeyMap={inputKeyMap}
            formSchema={superCategoryValidationSchema}
        ></SearchPage>
    )
}

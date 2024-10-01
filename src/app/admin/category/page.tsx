"use client"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import SearchPage from "~/app/admin/_components/search-page"

import { categoryValidationSchema, type CategorySchemaType } from "~/lib/validation"
import IdInput from "../_components/id-input"
import { convertSvgToImgSrc } from "~/lib/utils"

type ModelAttrs = keyof CategorySchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
        className?: string
    }
> = {
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
    superCategoryId: {
        node: (field) => (
            <IdInput
                slug="super-category"
                label="categoria mãe"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Categoria Mãe",
        description: "Esse é a categoria mãe da categoria.",
        className: "admin-input-md-center",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="categoria"
            namePlural="categorias"
            tableHeaders={{
                id: "ID",
                name: "Nome",
                SuperCategory: "Categoria Mãe",
            }}
            slug="generic-crud/category"
            inputKeyMap={inputKeyMap}
            tableValuesMap={{
                SuperCategory: (value: { name: string; iconSvg: string | null } | null) => (
                    <div className="flex flex-row items-center gap-2">
                        {value?.iconSvg && (
                            <img
                                src={convertSvgToImgSrc(value.iconSvg)}
                                alt={value.name}
                                className="aspect-square rounded-md object-cover"
                                height="24"
                                width="24"
                            ></img>
                        )}
                        <span className="text-nowrap">{value?.name ?? "N/A"}</span>
                    </div>
                ),
            }}
            formSchema={categoryValidationSchema}
        ></SearchPage>
    )
}

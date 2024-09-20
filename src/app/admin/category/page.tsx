"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { categoryGetMany, categoryGetOne, categoryCreateOne, categoryUpdateOne, categoryDeleteOne } from "~/server/queries"
import SingleImageField from "../_components/single-image-field"
import SearchPage from "~/app/admin/_components/search-page"

const zodValidationSchema = z.object({
    name: z.string().min(3, {
        message: "Nome deve ter ao menos 3 caracteres.",
    }),
    iconUrl: z.string().url("Selecione uma imagem."),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
    name: "",
    iconUrl: "",
}

type ModelAttrs = keyof SchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
    }
> = {
    iconUrl: {
        node: (field) => <SingleImageField {...field}></SingleImageField>,
        label: "Imagem do ícone da categoria.",
        description: "Escolha imagem para servir como ícone da categoria.",
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
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="categoria"
            namePlural="categorias"
            tableHeaders={["Ícone", "Nome"]}
            tableAttrs={["iconUrl", "name"] as ModelAttrsAndId[]}
            getManyQuery={categoryGetMany}
            deleteOneQuery={categoryDeleteOne}
            getOneQuery={categoryGetOne}
            createOneQuery={categoryCreateOne}
            updateOneQuery={categoryUpdateOne}
            defaultValues={defaultValues}
            inputKeyMap={inputKeyMap}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

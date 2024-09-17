"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import {
    categoryGetMany,
    categoryGetOne,
    categoryCreateOne,
    categoryUpdateOne,
    categoryDeleteOne,
} from "~/server/queries"
import SingleImageField from "../_components/single-image-field"

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
        node: (
            field: ControllerRenderProps<FieldValues, ModelAttrs>,
        ) => React.ReactNode
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
        node: (field) => <Input placeholder="Fanstasia" {...field} />,
        label: "Nome",
        description: "Esse é o nome da categoria.",
    },
}

export const searchPageProps = {
    title: "Categorias",
    description: "Crie, atualize, apague ou busque categorias cadastradas",
    slug: "category",
    tableHeaders: ["Ícone", "Nome"],
    tableAttrs: ["iconUrl", "name"] as ModelAttrs[],
    getManyQuery: categoryGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => categoryDeleteOne(id),
    idForQuestion: "categoria",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar categoria",
    mutationName: "category-update",
    waitingMessage: "Atualizando categoria...",
    successMessage: "Categoria atualizada",
    dbMutation: (data: SchemaType) => categoryUpdateOne(id, data),
    dbGetOne: () => categoryGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar categoria",
    mutationName: "category-create",
    waitingMessage: "Criando categoria...",
    successMessage: "Categoria criada",
    dbMutation: categoryCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

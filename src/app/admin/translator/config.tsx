"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import {
    translatorGetMany,
    translatorGetOne,
    translatorCreateOne,
    translatorUpdateOne,
    translatorDeleteOne,
} from "~/server/queries"

const zodValidationSchema = z.object({
    name: z.string().min(3, {
        message: "Nome deve ter ao menos 3 caracteres.",
    }),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
    name: "",
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
    name: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
}

export const searchPageProps = {
    title: "Tradutores",
    description: "Crie, atualize, apague ou busque Tradutores cadastradas",
    slug: "translator",
    tableHeaders: ["Nome"],
    tableAttrs: ["name"] as ModelAttrs[],
    getManyQuery: translatorGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => translatorDeleteOne(id),
    idForQuestion: "Tradutor",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar Tradutor",
    mutationName: "translator-update",
    waitingMessage: "Atualizando Tradutor...",
    successMessage: "Tradutor atualizado",
    dbMutation: (data: SchemaType) => translatorUpdateOne(id, data),
    dbGetOne: () => translatorGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar Tradutor",
    mutationName: "translator-create",
    waitingMessage: "Criando Tradutor...",
    successMessage: "Tradutor criado",
    dbMutation: translatorCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

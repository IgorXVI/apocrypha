"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import {
    publisherGetMany,
    publisherGetOne,
    publisherCreateOne,
    publisherUpdateOne,
    publisherDeleteOne,
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
        node: (field) => (
            <Input placeholder="Editora Campos Sales" {...field} />
        ),
        label: "Nome",
        description: "Esse é o nome da Editora.",
    },
}

export const searchPageProps = {
    title: "Editoras",
    description: "Crie, atualize, apague ou busque Editoras cadastradas",
    slug: "publisher",
    tableHeaders: ["Nome"],
    tableAttrs: ["name"] as ModelAttrs[],
    getManyQuery: publisherGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => publisherDeleteOne(id),
    idForQuestion: "Editora",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar Editora",
    mutationName: "publisher-update",
    waitingMessage: "Atualizando Editora...",
    successMessage: "Editora atualizada",
    dbMutation: (data: SchemaType) => publisherUpdateOne(id, data),
    dbGetOne: () => publisherGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar Editora",
    mutationName: "publisher-create",
    waitingMessage: "Criando Editora...",
    successMessage: "Editora criada",
    dbMutation: publisherCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

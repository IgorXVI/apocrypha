"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import {
    bookGetMany,
    bookGetOne,
    bookCreateOne,
    bookUpdateOne,
    bookDeleteOne,
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
    title: "Livros",
    description: "Crie, atualize, apague ou busque Livros cadastradas",
    slug: "book",
    tableHeaders: ["Nome"],
    tableAttrs: ["name"] as ModelAttrs[],
    getManyQuery: bookGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => bookDeleteOne(id),
    idForQuestion: "Livro",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar Livro",
    mutationName: "book-update",
    waitingMessage: "Atualizando Livro...",
    successMessage: "Livro atualizado",
    dbMutation: (data: SchemaType) => bookUpdateOne(id, data),
    dbGetOne: () => bookGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar Livro",
    mutationName: "book-create",
    waitingMessage: "Criando Livro...",
    successMessage: "Livro criado",
    dbMutation: bookCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

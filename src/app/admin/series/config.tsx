"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import {
    seriesGetMany,
    seriesGetOne,
    seriesCreateOne,
    seriesUpdateOne,
    seriesDeleteOne,
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
        node: (field) => <Input placeholder="Senhor dos Anéis" {...field} />,
        label: "Nome",
        description: "Esse é o nome da Série.",
    },
}

export const searchPageProps = {
    title: "Séries",
    description: "Crie, atualize, apague ou busque Séries cadastradas",
    slug: "series",
    tableHeaders: ["Nome"],
    tableAttrs: ["name"] as ModelAttrs[],
    getManyQuery: seriesGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => seriesDeleteOne(id),
    idForQuestion: "Série",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar Série",
    mutationName: "series-update",
    waitingMessage: "Atualizando Série...",
    successMessage: "Série atualizada",
    dbMutation: (data: SchemaType) => seriesUpdateOne(id, data),
    dbGetOne: () => seriesGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar Série",
    mutationName: "series-create",
    waitingMessage: "Criando Série...",
    successMessage: "Série criada",
    dbMutation: seriesCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

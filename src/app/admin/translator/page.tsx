"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { translatorGetMany, translatorGetOne, translatorCreateOne, translatorUpdateOne, translatorDeleteOne } from "~/server/queries"

import SearchPage from "~/app/admin/_components/search-page"

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
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
    }
> = {
    name: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="tradutor"
            namePlural="tradutores"
            tableHeaders={{
                id: "ID",
                name: "Nome",
            }}
            getManyQuery={translatorGetMany}
            deleteOneQuery={translatorDeleteOne}
            getOneQuery={translatorGetOne}
            createOneQuery={translatorCreateOne}
            updateOneQuery={translatorUpdateOne}
            defaultValues={defaultValues}
            inputKeyMap={inputKeyMap}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

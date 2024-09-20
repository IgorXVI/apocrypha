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

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={["ID", "name"]}
            tableAttrs={["id", "name"] as ModelAttrsAndId[]}
            getManyQuery={bookGetMany}
            deleteOneQuery={bookDeleteOne}
            getOneQuery={bookGetOne}
            createOneQuery={bookCreateOne}
            updateOneQuery={bookUpdateOne}
            defaultValues={defaultValues}
            inputKeyMap={inputKeyMap}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

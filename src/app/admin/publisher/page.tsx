"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { publisherGetMany, publisherGetOne, publisherCreateOne, publisherUpdateOne, publisherDeleteOne } from "~/server/queries"

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
                placeholder="Editora Campos Sales"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da Editora.",
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="editora"
            namePlural="editoras"
            tableHeaders={{
                id: "ID",
                name: "Nome",
            }}
            getManyQuery={publisherGetMany}
            deleteOneQuery={publisherDeleteOne}
            getOneQuery={publisherGetOne}
            createOneQuery={publisherCreateOne}
            updateOneQuery={publisherUpdateOne}
            defaultValues={defaultValues}
            inputKeyMap={inputKeyMap}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

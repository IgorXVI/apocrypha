"use client"

import SearchPage from "~/app/admin/_components/search-page"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { languageGetMany, languageGetOne, languageCreateOne, languageUpdateOne, languageDeleteOne } from "~/server/queries"

const zodValidationSchema = z.object({
    name: z.string().min(3, {
        message: "Prefixo deve ter ao menos 1 caracter.",
    }),
    iso6392Code: z.string().length(3, {
        message: "Código ISO 6392 deve ter 3 caracteres.",
    }),
    iso6391Code: z.string().length(2, {
        message: "Código ISO 6391 deve ter 2 caracteres.",
    }),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
    name: "",
    iso6391Code: "",
    iso6392Code: "",
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
                placeholder="Inglês"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da língua.",
    },
    iso6391Code: {
        node: (field) => (
            <Input
                placeholder="pt"
                {...field}
            />
        ),
        label: "Código ISO 6391",
        description: (
            <>
                Esse é o código
                <a
                    href="https://pt.wikipedia.org/wiki/ISO_6391"
                    className="underline mr-1 ml-1"
                >
                    ISO 6391
                </a>
                da moeda.
            </>
        ),
    },
    iso6392Code: {
        node: (field) => (
            <Input
                placeholder="eng"
                {...field}
            />
        ),
        label: "Código ISO 6392",
        description: (
            <>
                Esse é o código
                <a
                    href="https://pt.wikipedia.org/wiki/ISO_6392"
                    className="underline mr-1 ml-1"
                >
                    ISO 6392
                </a>
                da moeda.
            </>
        ),
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="moeda"
            namePlural="moedas"
            tableHeaders={["ID", "Nome", "Código ISO 6391", "Código ISO 6392"]}
            tableAttrs={["id", "name", "iso6391Code", "iso6392Code"] as ModelAttrsAndId[]}
            getManyQuery={languageGetMany}
            deleteOneQuery={languageDeleteOne}
            getOneQuery={languageGetOne}
            createOneQuery={languageCreateOne}
            updateOneQuery={languageUpdateOne}
            defaultValues={defaultValues}
            inputKeyMap={inputKeyMap}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

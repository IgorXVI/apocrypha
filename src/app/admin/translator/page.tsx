import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { translatorGetMany, translatorGetOne, translatorCreateOne, translatorUpdateOne, translatorDeleteOne } from "~/server/queries"

import SearchPage from "~/app/admin/_components/search-page"

import { translatorValidationSchema, type TranslatorSchemaType } from "~/server/validation"

type ModelAttrs = keyof TranslatorSchemaType

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
            inputKeyMap={inputKeyMap}
            formSchema={translatorValidationSchema}
        ></SearchPage>
    )
}

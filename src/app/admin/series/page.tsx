import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { seriesGetMany, seriesGetOne, seriesCreateOne, seriesUpdateOne, seriesDeleteOne } from "~/server/queries"

import SearchPage from "~/app/admin/_components/search-page"

import { seriesValidationSchema, type SeriesSchemaType } from "~/server/validation"

type ModelAttrs = keyof SeriesSchemaType

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
                placeholder="Senhor dos Anéis"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da Série.",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="série"
            namePlural="séries"
            tableHeaders={{
                id: "ID",
                name: "Nome",
            }}
            getManyQuery={seriesGetMany}
            deleteOneQuery={seriesDeleteOne}
            getOneQuery={seriesGetOne}
            createOneQuery={seriesCreateOne}
            updateOneQuery={seriesUpdateOne}
            inputKeyMap={inputKeyMap}
            formSchema={seriesValidationSchema}
        ></SearchPage>
    )
}

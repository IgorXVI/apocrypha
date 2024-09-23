import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { categoryGetMany, categoryGetOne, categoryCreateOne, categoryUpdateOne, categoryDeleteOne } from "~/server/queries"
import SingleImageField from "../_components/single-image-field"
import SearchPage from "~/app/admin/_components/search-page"

import { categoryValidationSchema, type CategorySchemaType } from "~/server/validation"

type ModelAttrs = keyof CategorySchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
        className?: string
    }
> = {
    iconUrl: {
        node: (field) => <SingleImageField {...field}></SingleImageField>,
        label: "Imagem do ícone da categoria.",
        description: "Escolha imagem para servir como ícone da categoria.",
        className: "admin-input-md-center",
    },
    name: {
        node: (field) => (
            <Input
                placeholder="Fanstasia"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome da categoria.",
        className: "admin-input-md-center",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="categoria"
            namePlural="categorias"
            tableHeaders={{
                id: "ID",
                iconUrl: "Ícone",
                name: "Nome",
            }}
            getManyQuery={categoryGetMany}
            deleteOneQuery={categoryDeleteOne}
            getOneQuery={categoryGetOne}
            createOneQuery={categoryCreateOne}
            updateOneQuery={categoryUpdateOne}
            inputKeyMap={inputKeyMap}
            formSchema={categoryValidationSchema}
        ></SearchPage>
    )
}

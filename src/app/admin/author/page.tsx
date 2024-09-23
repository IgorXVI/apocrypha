import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { authorGetMany, authorGetOne, authorCreateOne, authorUpdateOne, authorDeleteOne } from "~/server/queries"
import { Textarea } from "~/components/ui/textarea"
import SingleImageField from "../_components/single-image-field"
import SearchPage from "../_components/search-page"

import { authorValidationSchema, type AuthorSchemaType } from "~/server/validation"

type ModelAttrs = keyof AuthorSchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
        className?: string
    }
> = {
    imgUrl: {
        node: (field) => <SingleImageField {...field}></SingleImageField>,
        label: "Imagem de perfil",
        description: "Escolha a foto para o perfil do autor.",
        className: "admin-input-md-center",
    },
    name: {
        node: (field) => (
            <Input
                placeholder="Fulano da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do autor.",
        className: "admin-input-md-center",
    },
    about: {
        node: (field) => (
            <Textarea
                className="h-[25vh]"
                placeholder="O Fulando da Silva é uma autor de livros..."
                {...field}
            />
        ),
        label: "Sobre",
        description: "Campo para descrever quem é o autor.",
        className: "admin-input-md-center",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="autor"
            namePlural="autores"
            tableHeaders={{
                id: "ID",
                imgUrl: "Imagem de perfil",
                name: "Nome",
                about: "Sobre",
            }}
            getManyQueryAction={authorGetMany}
            deleteOneQueryAction={authorDeleteOne}
            getOneQueryAction={authorGetOne}
            createOneQueryAction={authorCreateOne}
            updateOneQueryAction={authorUpdateOne}
            inputKeyMap={inputKeyMap}
            formSchema={authorValidationSchema}
        ></SearchPage>
    )
}

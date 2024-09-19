"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import {
    authorGetMany,
    authorGetOne,
    authorCreateOne,
    authorUpdateOne,
    authorDeleteOne,
} from "~/server/queries"
import { Textarea } from "~/components/ui/textarea"
import SingleImageField from "../_components/single-image-field"
import SearchPage from "../_components/search-page"

const zodValidationSchema = z.object({
    name: z.string().min(3, {
        message: "Nome deve ter ao menos 3 caracteres.",
    }),
    about: z.string().min(5, {
        message: "Sobre deve ter ao menos 5 caracteres.",
    }),
    imgUrl: z.string().url("Selecione uma imagem."),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
    name: "",
    about: "",
    imgUrl: "",
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
    imgUrl: {
        node: (field) => <SingleImageField {...field}></SingleImageField>,
        label: "Imagem de perfil",
        description: "Escolha a foto para o perfil do autor.",
    },
    name: {
        node: (field) => <Input placeholder="Fulano da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do autor.",
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
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="autor"
            namePlural="autores"
            tableHeaders={["ID", "Imagem de perfil", "Nome", "Sobre"]}
            tableAttrs={["id", "imgUrl", "name", "about"] as ModelAttrsAndId[]}
            getManyQuery={authorGetMany}
            deleteOneQuery={authorDeleteOne}
            getOneQuery={authorGetOne}
            createOneQuery={authorCreateOne}
            updateOneQuery={authorUpdateOne}
            defaultValues={defaultValues}
            inputKeyMap={inputKeyMap}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

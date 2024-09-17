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
                className="h-[50vh]"
                placeholder="O Fulando da Silva é uma autor de livros..."
                {...field}
            />
        ),
        label: "Sobre",
        description: "Campo para descrever quem é o autor.",
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export const searchPageProps = {
    title: "Autores",
    description: "Crie, atualize, apague ou busque autores cadastrados.",
    slug: "author",
    tableHeaders: ["ID", "Imagem de perfil", "Nome", "Sobre"],
    tableAttrs: ["id", "imgUrl", "name", "about"] as ModelAttrsAndId[],
    getManyQuery: authorGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => authorDeleteOne(id),
    idForQuestion: "autor",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar autor",
    mutationName: "author-update",
    waitingMessage: "Atualizando autor...",
    successMessage: "Autor atualizado",
    dbMutation: (data: SchemaType) => authorUpdateOne(id, data),
    dbGetOne: () => authorGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar autores",
    mutationName: "author-create",
    waitingMessage: "Criando autor...",
    successMessage: "Autor criado",
    dbMutation: authorCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

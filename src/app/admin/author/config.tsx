"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"

import { Input } from "~/components/ui/input"
import {
    authorGetMany,
    authorGetOne,
    authorCreateOne,
    authorUpdateOne,
    authorDeleteOne,
} from "~/server/queries"
import { UploadButton } from "~/lib/utils"
import { Textarea } from "~/components/ui/textarea"

const zodValidationSchema = z.object({
    name: z.string().min(3, {
        message: "Nome deve ter ao menos 3 caracteres.",
    }),
    about: z.string().min(5, {
        message: "Sobre deve ter ao menos 5 caracteres.",
    }),
    imgUrl: z.string().url("Deve ser uma URL."),
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
    name: {
        node: (field) => <Input placeholder="Fulano da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do autor.",
    },
    about: {
        node: (field) => (
            <Textarea
                placeholder="O Fulando da Silva é uma autor de livros..."
                {...field}
            />
        ),
        label: "Sobre",
        description: "Campo para descrever quem é o autor.",
    },
    imgUrl: {
        node: (field) => (
            <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                    toast(
                        <span className="text-lg text-green-500">
                            Upload concluído.
                        </span>,
                    )
                    field.onChange(res[0]?.url)
                }}
                onUploadError={(error: Error) => {
                    toast(
                        <span className="text-red-500">
                            Erro ao tentar fazer upload da imagem:{" "}
                            {error.message}
                        </span>,
                    )
                }}
            ></UploadButton>
        ),
        label: "Imagem de perfil",
        description: "Escolha a foto para o perfil do autor.",
    },
}

export const searchPageProps = {
    title: "Autors",
    description: "Crie, atualize, apague ou busque autores cadastrados",
    slug: "author",
    tableHeaders: ["Nome", "Sobre", "URL da imagem de perfil"],
    tableAttrs: ["name", "about", "imgUrl"] as ModelAttrs[],
    getManyQuery: authorGetMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => authorDeleteOne(id),
    idForQuestion: "autor",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar Autor",
    mutationName: "author-update",
    waitingMessage: "Atualizando Autor...",
    successMessage: "Autor atualizao",
    dbMutation: (data: SchemaType) => authorUpdateOne(id, data),
    dbGetOne: () => authorGetOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar Autor",
    mutationName: "author-create",
    waitingMessage: "Criando Autor...",
    successMessage: "Autor criado",
    dbMutation: authorCreateOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

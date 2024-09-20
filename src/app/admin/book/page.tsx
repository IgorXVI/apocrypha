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
    stripeId: z.string().min(1, { message: "Stripe ID é obrigatório." }),
    price: z
        .number()
        .positive({ message: "Preço deve ser um número positivo." }),
    amount: z.number().int().positive({
        message: "Quantidade deve ser um número inteiro positivo.",
    }),
    title: z.string().min(1, { message: "Título é obrigatório." }),
    descriptionTitle: z.string().max(100, {
        message: "Título da descrição deve ter no máximo 100 caracteres.",
    }),
    description: z.string().min(1, { message: "Descrição é obrigatória." }),
    pages: z.number().int().positive({
        message: "Número de páginas deve ser um número inteiro positivo.",
    }),
    publicationDate: z.date({
        required_error: "Data de publicação é obrigatória.",
    }),
    isbn10Code: z
        .string()
        .length(10, { message: "ISBN-10 deve ter exatamente 10 caracteres." }),
    isbn13Code: z
        .string()
        .length(14, { message: "ISBN-13 deve ter exatamente 14 caracteres." }),
    width: z
        .number()
        .int()
        .positive({ message: "Largura deve ser um número inteiro positivo." }),
    height: z
        .number()
        .int()
        .positive({ message: "Altura deve ser um número inteiro positivo." }),
    length: z.number().int().positive({
        message: "Comprimento deve ser um número inteiro positivo.",
    }),
    edition: z.string().optional(),
    categoryId: z.string().uuid({ message: "ID da categoria inválido." }),
    publisherId: z.string().uuid({ message: "ID da editora inválido." }),
    languageId: z.string().uuid({ message: "ID do idioma inválido." }),
    seriesId: z.string().uuid({ message: "ID da série inválido." }).optional(),
    currencyId: z.string().uuid({ message: "ID da moeda inválido." }),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
    stripeId: "",
    price: 0,
    amount: 0,
    title: "",
    descriptionTitle: "",
    description: "",
    pages: 0,
    publicationDate: new Date(),
    isbn10Code: "",
    isbn13Code: "",
    width: 0,
    height: 0,
    length: 0,
    edition: "",
    categoryId: "",
    publisherId: "",
    languageId: "",
    seriesId: "",
    currencyId: "",
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
    stripeId: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    price: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    amount: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    title: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    descriptionTitle: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    description: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    pages: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    publicationDate: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    isbn10Code: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    isbn13Code: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    width: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    height: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    length: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    edition: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    categoryId: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    publisherId: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    languageId: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    seriesId: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    currencyId: {
        node: (field) => <Input placeholder="Rogério da Silva" {...field} />,
    },
}

type ModelAttrsAndId = ModelAttrs | "id"

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={[
                "ID",
                "Preço",
                "Quantidade",
                "ID do Stripe",
                "Título",
                "Descrição",
                "Páginas",
                "Data de publicação",
                "ISBN-10",
                "ISBN-13",
                "Largura",
                "Altura",
                "Comprimento",
                "Edição",
                "Categoria",
                "Editora",
                "Idioma",
                "Série",
                "Moeda",
            ]}
            tableAttrs={
                [
                    "id",
                    "price",
                    "amount",
                    "stripeId",
                    "descriptionTitle",
                    "description",
                    "pages",
                    "publicationDate",
                    "isbn10Code",
                    "isbn13Code",
                    "width",
                    "height",
                    "length",
                    "edition",
                    "categoryId",
                    "publisherId",
                    "languageId",
                    "seriesId",
                    "currencyId",
                ] as ModelAttrsAndId[]
            }
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

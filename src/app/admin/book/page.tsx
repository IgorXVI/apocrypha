"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { bookGetMany, bookGetOne, bookCreateOne, bookUpdateOne, bookDeleteOne } from "~/server/book-queries"
import { type BookGetManyOutput } from "~/server/types"

import SearchPage from "~/app/admin/_components/search-page"

const zodValidationSchema = z.object({
    price: z.number().positive({ message: "O preço deve ser um número positivo." }),
    amount: z.number().int().positive({ message: "A quantidade deve ser um número inteiro positivo." }),
    title: z.string().min(1, { message: "O título é obrigatório." }),
    descriptionTitle: z.string({ required_error: "O título da descrição é obrigatório." }),
    description: z.string({ required_error: "A descrição é obrigatória." }).max(100, {
        message: "Título da descrição deve ter no máximo 100 caracteres.",
    }),
    pages: z.number().int().positive({ message: "O número de páginas deve ser um número inteiro positivo." }),
    publicationDate: z.date({ required_error: "A data de publicação é obrigatória." }),
    isbn10Code: z.string().length(10, { message: "O ISBN-10 deve ter exatamente 10 caracteres." }),
    isbn13Code: z.string().length(13, { message: "O ISBN-13 deve ter exatamente 13 caracteres." }),
    width: z.number().positive({ message: "A largura deve ser um número positivo." }),
    height: z.number().positive({ message: "A altura deve ser um número positivo." }),
    length: z.number().positive({ message: "O comprimento deve ser um número positivo." }),
    edition: z.string().optional(),
    categoryId: z.string().uuid({ message: "O ID da categoria é inválido." }),
    publisherId: z.string().uuid({ message: "O ID da editora é inválido." }),
    languageId: z.string().uuid({ message: "O ID do idioma é inválido." }),
    currencyId: z.string().uuid({ message: "O ID da moeda é inválido." }),
    seriesId: z.string().uuid({ message: "O ID da série é inválido." }).optional(),
    imagesArr: z.array(z.string().url({ message: "URL da imagem inválida." })),
    authorIds: z.array(z.string().uuid({ message: "ID do autor inválido." })),
    translatorIds: z.array(z.string().uuid({ message: "ID do tradutor inválido." })),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
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
    authorIds: [],
    translatorIds: [],
    imagesArr: [],
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
    price: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    amount: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    title: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    descriptionTitle: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    description: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    pages: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    publicationDate: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    isbn10Code: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    isbn13Code: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    width: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    height: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    length: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    edition: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    categoryId: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    publisherId: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    languageId: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    seriesId: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    currencyId: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    authorIds: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    translatorIds: {
        node: (field) => (
            <Input
                placeholder="Rogério da Silva"
                {...field}
            />
        ),
        label: "Nome",
        description: "Esse é o nome do Tradutor.",
    },
    imagesArr: {
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

type GetManyAttrs = keyof BookGetManyOutput

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={[
                "ID",
                "Imagem",
                "Preço",
                "Quantidade",
                "Stripe ID",
                "Título",
                "Descrição",
                "Páginas",
                "Data de Publicação",
                "ISBN-10",
                "ISBN-13",
                "Largura",
                "Altura",
                "Comprimento",
                "Edição",
                "Idioma",
                "Moeda",
                "Editora",
                "Série",
                "Autor",
                "Tradutor",
            ]}
            tableAttrs={
                [
                    "id",
                    "mainImageUrl",
                    "price",
                    "amount",
                    "stripeId",
                    "title",
                    "description",
                    "pages",
                    "publicationDate",
                    "isbn10Code",
                    "isbn13Code",
                    "width",
                    "height",
                    "length",
                    "edition",
                    "languageName",
                    "currencyLabel",
                    "categoryName",
                    "publisherName",
                    "seriesName",
                    "mainAuthorName",
                    "mainTranslatorName",
                ] as GetManyAttrs[]
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

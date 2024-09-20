"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { bookGetMany, bookGetOne, bookCreateOne, bookUpdateOne, bookDeleteOne } from "~/server/book-queries"
import { type BookGetManyOneRowOutput } from "~/server/types"

import SearchPage from "~/app/admin/_components/search-page"
import { DatePicker } from "../_components/date-picker"

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
                type="number"
                {...field}
            />
        ),
        label: "Preço",
        description: "Esse é o preço do livro.",
    },
    amount: {
        node: (field) => (
            <Input
                type="number"
                {...field}
            />
        ),
        label: "Quantidade em Estoque",
        description: "Esse é a quantidade em estoque do livro.",
    },
    title: {
        node: (field) => (
            <Input
                placeholder="As duas Torres"
                {...field}
            />
        ),
        label: "Título",
        description: "Esse é o título do livro.",
    },
    descriptionTitle: {
        node: (field) => (
            <Input
                placeholder="Resenha de As duas torres"
                {...field}
            />
        ),
        label: "Título da Descrição",
        description: "Esse é o título da descrição do livro.",
    },
    description: {
        node: (field) => (
            <Input
                placeholder="O livro é muito bom pois ele fala sobre..."
                {...field}
            />
        ),
        label: "Descrição",
        description: "Esse é a descrição do livro.",
    },
    pages: {
        node: (field) => (
            <Input
                type="number"
                {...field}
            />
        ),
        label: "Quantidade de Páginas",
        description: "Esse é a quantidade de páginas do livro.",
    },
    publicationDate: {
        node: (field) => <DatePicker {...field} />,
        label: "Data de Publicação",
        description: "Esse é a data de publicação do livro.",
    },
    isbn10Code: {
        node: (field) => (
            <Input
                placeholder="1234567890..."
                {...field}
            />
        ),
        label: "Código ISBN-10",
        description: "Esse é o código ISBN-10 do livro.",
    },
    isbn13Code: {
        node: (field) => (
            <Input
                placeholder="1234567890..."
                {...field}
            />
        ),
        label: "Código ISBN-13",
        description: "Esse é o código ISBN-13 do livro.",
    },
    width: {
        node: (field) => (
            <Input
                type="number"
                {...field}
            />
        ),
        label: "Largura (mm)",
        description: "Esse é a largura do livro em milímetros.",
    },
    height: {
        node: (field) => (
            <Input
                type="number"
                {...field}
            />
        ),
        label: "Altura (mm)",
        description: "Esse é a altura do livro em milímetros.",
    },
    length: {
        node: (field) => (
            <Input
                type="number"
                {...field}
            />
        ),
        label: "Comprimento (mm)",
        description: "Esse é o comprimento do livro em milímetros.",
    },
    edition: {
        node: (field) => (
            <Input
                placeholder="Edição português"
                {...field}
            />
        ),
        label: "Edição",
        description: "Esse é a edição do livro.",
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

type BookAttrs = keyof BookGetManyOneRowOutput

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={[
                "ID",
                "Imagem",
                "Preço",
                "Quantidade em Estoque",
                "Stripe ID",
                "Título",
                "Descrição",
                "Páginas",
                "Data de Publicação",
                "ISBN-10",
                "ISBN-13",
                "Largura (mm)",
                "Altura (mm)",
                "Comprimento (mm)",
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
                ] as BookAttrs[]
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

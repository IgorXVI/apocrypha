"use client"

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { bookGetMany, bookGetOne, bookCreateOne, bookUpdateOne, bookDeleteOne } from "~/server/book-queries"

import {
    getCategorySuggestions,
    getPublisherSuggestions,
    getLanguageSuggestions,
    getSeriesSuggestions,
    getCurrencySuggestions,
    getAuthorSuggestions,
    getTranslatorSuggestions,
} from "~/server/queries"

import SearchPage from "~/app/admin/_components/search-page"
import { DatePicker } from "../_components/date-picker"
import MultipleImageField from "../_components/multiple-image-field"
import IdInput from "../_components/id-input"
import { Textarea } from "~/components/ui/textarea"
import NumberInput from "../_components/number-input"
import SingleImageField from "../_components/single-image-field"

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
    imgUrls: z.array(z.string().url({ message: "URL da imagem inválida." })),
    mainImgUrl: z.string().url({ message: "URL da imagem inválida." }),
    authorId: z.string().uuid({ message: "ID do autor inválido." }),
    translatorId: z.string().uuid({ message: "ID do tradutor inválido." }),
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
    authorId: "",
    translatorId: "",
    imgUrls: [],
    mainImgUrl: "",
}

type ModelAttrs = keyof SchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (field: ControllerRenderProps<FieldValues, ModelAttrs>) => React.ReactNode
        label: string
        description: string | React.ReactNode
        className?: string
    }
> = {
    mainImgUrl: {
        node: (field) => <SingleImageField {...field} />,
        label: "Imagem Principal",
        description: "Selecione a imagem principal do livro.",
        className: "md:col-span-2 flex flex-col justify-center md:ml-[25%] md:mr-[25%]",
    },
    imgUrls: {
        node: (field) => <MultipleImageField {...field}></MultipleImageField>,
        label: "Imagens",
        description: "Selecione as imagens para o anúncio do livro.",
        className: "md:col-span-2 flex flex-col justify-center md:ml-[25%] md:mr-[25%]",
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
    pages: {
        node: (field) => <NumberInput {...field} />,
        label: "Quantidade de Páginas",
        description: "Esse é a quantidade de páginas do livro.",
    },
    description: {
        node: (field) => (
            <Textarea
                className="h-[25vh]"
                placeholder="O livro é muito bom pois ele fala sobre..."
                {...field}
            />
        ),
        label: "Descrição",
        description: "Esse é a descrição do livro.",
    },
    currencyId: {
        node: (field) => (
            <IdInput
                label="moeda"
                getSuggestions={getCurrencySuggestions}
                {...field}
            />
        ),
        label: "Moeda",
        description: "Escolha a moeda do livro.",
        className: "max-w-[250px]",
    },
    price: {
        node: (field) => <NumberInput {...field} />,
        label: "Preço",
        description: "Esse é o preço do livro.",
    },
    amount: {
        node: (field) => <NumberInput {...field} />,
        label: "Quantidade em Estoque",
        description: "Esse é a quantidade em estoque do livro.",
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
        node: (field) => <NumberInput {...field} />,
        label: "Largura (mm)",
        description: "Esse é a largura do livro em milímetros.",
    },
    height: {
        node: (field) => <NumberInput {...field} />,
        label: "Altura (mm)",
        description: "Esse é a altura do livro em milímetros.",
    },
    length: {
        node: (field) => <NumberInput {...field} />,
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
            <IdInput
                label="categoria"
                getSuggestions={getCategorySuggestions}
                {...field}
            />
        ),
        label: "Categoria",
        description: "Escolha a categoria do livro.",
    },
    publisherId: {
        node: (field) => (
            <IdInput
                label="editora"
                getSuggestions={getPublisherSuggestions}
                {...field}
            />
        ),
        label: "Editora",
        description: "Escolha a editora do livro.",
    },
    languageId: {
        node: (field) => (
            <IdInput
                label="língua"
                getSuggestions={getLanguageSuggestions}
                {...field}
            />
        ),
        label: "Língua",
        description: "Escolha a língua do livro.",
    },
    seriesId: {
        node: (field) => (
            <IdInput
                label="série"
                getSuggestions={getSeriesSuggestions}
                {...field}
            />
        ),
        label: "Série",
        description: "Escolha a série do livro.",
    },
    authorId: {
        node: (field) => (
            <IdInput
                getSuggestions={getAuthorSuggestions}
                label="autor"
                {...field}
            />
        ),
        label: "Autor",
        description: "Escolha o autor do livro.",
    },

    translatorId: {
        node: (field) => (
            <IdInput
                getSuggestions={getTranslatorSuggestions}
                label="tradutor"
                {...field}
            />
        ),
        label: "Tradutor",
        description: "Escolha o tradutor do livro.",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={{
                id: "ID",
                mainImageUrl: "Imagem",
                price: "Preço",
                currencyLabel: "Moeda",
                amount: "Estoque",
                stripeId: "Stripe ID",
                title: "Título",
                descriptionTitle: "Título da Descrição",
                description: "Descrição",
                pages: "Páginas",
                publicationDate: "Data de Publicação",
                isbn10Code: "ISBN-10",
                isbn13Code: "ISBN-13",
                width: "Largura (mm)",
                height: "Altura (mm)",
                length: "Comprimento (mm)",
                edition: "Edição",
                languageName: "Idioma",
                categoryName: "Categoria",
                publisherName: "Editora",
                seriesName: "Série",
                mainAuthorName: "Autor",
                mainTranslatorName: "Tradutor",
            }}
            getManyQuery={bookGetMany}
            deleteOneQuery={bookDeleteOne}
            getOneQuery={bookGetOne}
            createOneQuery={bookCreateOne}
            updateOneQuery={bookUpdateOne}
            defaultValues={defaultValues}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inputKeyMap={inputKeyMap as any}
            formSchema={zodValidationSchema}
        ></SearchPage>
    )
}

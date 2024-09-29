"use client"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

import SearchPage from "~/app/admin/_components/search-page"
import { DatePicker } from "../_components/date-picker"
import MultipleImageField from "../_components/multiple-image-field"
import IdInput from "../_components/id-input"
import NumberInput from "../_components/number-input"
import SingleImageField from "../_components/single-image-field"

import { bookValidationSchema, type BookSchemaType } from "~/lib/validation"
import { AdminRichTextInput } from "../_components/admin-rich-text-editor"
import SelectEnum from "../_components/select-enum"
import BooleanInput from "../_components/boolean-input"

type ModelAttrs = keyof BookSchemaType

const langsMap: Record<string, string> = {
    PORTUGUESE: "Português",
    ENGLISH: "Inglês",
    SPANISH: "Espanhol",
    FRENCH: "Francês",
    GERMAN: "Alemão",
    ITALIAN: "Italiano",
    TURKISH: "Turco",
    RUSSIAN: "Russo",
    ARABIC: "Árabe",
    PORTUGUESE_BRAZILIAN: "Português (Brasil)",
}

const literatureTypeMap: Record<string, string> = {
    INTERNATIONAL: "Internacional",
    BRAZILIAN: "Nacional",
}

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
        className: "admin-input-md-center",
    },
    imgUrls: {
        node: (field) => <MultipleImageField {...field}></MultipleImageField>,
        label: "Imagens",
        description: "Selecione as imagens para o anúncio do livro.",
        className: "admin-input-md-center",
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
        className: "admin-input-md-center",
    },
    description: {
        node: (field) => (
            <AdminRichTextInput
                size="medium"
                {...field}
            />
        ),
        label: "Descrição",
        description: "Esse é a descrição do livro.",
        className: "admin-input-md-center",
    },
    pages: {
        node: (field) => <NumberInput {...field} />,
        label: "Quantidade de Páginas",
        description: "Esse é a quantidade de páginas do livro.",
    },
    price: {
        node: (field) => <NumberInput {...field} />,
        label: "Preço",
        description: "Esse é o preço do livro.",
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
    edition: {
        node: (field) => <NumberInput {...field} />,
        label: "Edição",
        description: "Esse é a edição do livro.",
    },
    categoryId: {
        node: (field) => (
            <IdInput
                label="categoria"
                slug="category"
                maxSelected={1}
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
                slug="publisher"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Editora",
        description: "Escolha a editora do livro.",
    },
    seriesId: {
        node: (field) => (
            <IdInput
                label="série"
                slug="series"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Série",
        description: "Escolha a série do livro.",
    },
    authorIds: {
        node: (field) => (
            <IdInput
                slug="author"
                label="autor"
                {...field}
            />
        ),
        label: "Autor",
        description: "Escolha o autor do livro.",
    },
    translatorIds: {
        node: (field) => (
            <IdInput
                slug="translator"
                label="tradutor"
                {...field}
            />
        ),
        label: "Tradutor",
        description: "Escolha o tradutor do livro.",
    },
    isAvailable: {
        node: (field) => <BooleanInput {...field} />,
        label: "Disponível",
        description: "Esse é o status de disponibilidade do livro.",
    },
    language: {
        node: (field) => (
            <SelectEnum
                {...field}
                enumLikeObject={langsMap}
            ></SelectEnum>
        ),
        label: "Idioma",
        description: "Escolha o idioma do livro.",
    },
    literatureType: {
        node: (field) => (
            <SelectEnum
                {...field}
                enumLikeObject={literatureTypeMap}
            ></SelectEnum>
        ),
        label: "Tipo de Literatura",
        description: "Escolha o tipo de literatura do livro.",
    },
    relatedBookId: {
        node: (field) => (
            <IdInput
                slug="book"
                label="livro relacionado"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Livro Relacionado",
        description: "Escolha o livro que possui uma relação com este.",
    },
}

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={{
                id: "ID",
                mainImageUrl: "Imagem Principal",
                title: "Título",
                price: "Preço",
                isAvailable: "Disponível",
                stripeId: "Stripe ID",
                description: "Descrição",
                pages: "Páginas",
                publicationDate: "Data de Publicação",
                isbn10Code: "ISBN-10",
                isbn13Code: "ISBN-13",
                edition: "Edição",
                categoryName: "Categoria",
                publisherName: "Editora",
                literatureType: "Tipo de Literatura",
                language: "Idioma",
                seriesName: "Série",
                relatedBookTitle: "Livro Relacionado",
                mainAuthorName: "Autor Principal",
                mainTranslatorName: "Tradutor Principal",
            }}
            tableValuesMap={{
                price: (value: number) => <span className="text-nowrap">R$ {value.toFixed(2)}</span>,
                literatureType: (value: string) => <span className="text-nowrap">{literatureTypeMap[value] ?? value}</span>,
                language: (value: string) => <span className="text-nowrap">{langsMap[value] ?? value}</span>,
            }}
            slug="book"
            inputKeyMap={inputKeyMap}
            formSchema={bookValidationSchema}
        ></SearchPage>
    )
}

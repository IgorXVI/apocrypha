"use client"

import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

import SearchPage from "~/app/admin/_components/search-page"
import { DatePicker } from "../_components/date-picker"
import MultipleImageField from "../_components/multiple-image-field"
import IdInput from "../_components/id-input"
import NumberInput from "../_components/number-input"
import SingleImageField from "../_components/single-image-field"

import { bookValidationSchema, type BookSchemaType } from "~/server/validation"
import { AdminRichTextInput } from "../_components/admin-rich-text-editor"

type ModelAttrs = keyof BookSchemaType

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
    descriptionTitle: {
        node: (field) => (
            <Input
                placeholder="Resenha de As duas torres"
                {...field}
            />
        ),
        label: "Título da Descrição",
        description: "Esse é o título da descrição do livro.",
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
    currencyId: {
        node: (field) => (
            <IdInput
                label="moeda"
                slug="currency"
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
                slug="category"
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
                slug="language"
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
                slug="series"
                {...field}
            />
        ),
        label: "Série",
        description: "Escolha a série do livro.",
    },
    authorId: {
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

    translatorId: {
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
}

export default function MainPage() {
    return (
        <SearchPage
            name="livro"
            namePlural="livros"
            tableHeaders={{
                id: "ID",
                mainImageUrl: "Imagem",
                currencyLabel: "Moeda",
                price: "Preço",
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
            slug="book"
            inputKeyMap={inputKeyMap}
            formSchema={bookValidationSchema}
        ></SearchPage>
    )
}

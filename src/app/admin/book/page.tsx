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
import BookStockUpdate from "../_components/book-stock-update"
import BookPriceUpdate from "../_components/book-price-update"

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
        description: "Link da imagem principal do livro.",
        className: "admin-input-md-center",
    },
    imgUrls: {
        node: (field) => <MultipleImageField {...field}></MultipleImageField>,
        label: "Outras Imagens",
        description: "Link de cada imagem, separados por uma quebra de linha.",
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
    heightCm: {
        node: (field) => <NumberInput {...field} />,
        label: "Altura (cm)",
        description: "Esse é a altura da capa do livro.",
    },
    widthCm: {
        node: (field) => <NumberInput {...field} />,
        label: "Largura (cm)",
        description: "Essa é a largura da capa do livro.",
    },
    thicknessCm: {
        node: (field) => <NumberInput {...field} />,
        label: "Grossura (cm)",
        description: "Esse é a grossura (depende da quantidade de páginas) do livro.",
    },
    weightGrams: {
        node: (field) => <NumberInput {...field} />,
        label: "Peso (g)",
        description: "Peso do livro (em gramas).",
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
    placeInSeries: {
        node: (field) => <NumberInput {...field} />,
        label: "Posição na Série",
        description: "Esse é a posição do livro na série.",
    },
    mainAuthorId: {
        node: (field) => (
            <IdInput
                slug="author"
                label="autor"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Autor Principal",
        description: "Escolha o autor principal do livro.",
    },
    authorIds: {
        node: (field) => (
            <IdInput
                slug="author"
                label="autor"
                {...field}
            />
        ),
        label: "Outros Autores",
        description: "Escolha os demais autores do livro.",
    },
    mainTranslatorId: {
        node: (field) => (
            <IdInput
                slug="translator"
                label="tradutor"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Tradutor Principal",
        description: "Escolha o tradutor principal do livro.",
    },
    translatorIds: {
        node: (field) => (
            <IdInput
                slug="translator"
                label="tradutor"
                {...field}
            />
        ),
        label: "Outros Tradutores",
        description: "Escolha os demais tradutores do livro.",
    },
    mainCategoryId: {
        node: (field) => (
            <IdInput
                label="categoria principal"
                slug="super-category-composite"
                maxSelected={1}
                {...field}
            />
        ),
        label: "Categoria Principal",
        description: "Escolha a categoria principal do livro.",
    },
    categoryIds: {
        node: (field) => (
            <IdInput
                label="categorias"
                slug="super-category-composite"
                {...field}
            />
        ),
        label: "Outras Categorias",
        description: "Escolha as demais categorias do livro.",
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
    stock: {
        node: (field) => <NumberInput {...field} />,
        label: "Estoque",
        description: "Quantidade de livros em estoque.",
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
                prevPrice: "Preço anterior",
                stock: "Estoque",
                stripeId: "Produto no Stripe",
                description: "Descrição",
                pages: "Páginas",
                publicationDate: "Data de Publicação",
                isbn10Code: "ISBN-10",
                isbn13Code: "ISBN-13",
                edition: "Edição",
                categoryName: "Categoria",
                publisherName: "Editora",
                language: "Idioma",
                seriesName: "Série",
                placeInSeries: "Posição na Série",
                relatedBookTitle: "Livro Relacionado",
                mainAuthorName: "Autor Principal",
                mainTranslatorName: "Tradutor Principal",
                heightCm: "Altura (cm)",
                widthCm: "Largura (cm)",
                thicknessCm: "Grossura (cm)",
                weightGrams: "Peso (g)",
            }}
            tableValuesMap={{
                stripeId: (value: string) => (
                    <a
                        className="hover:underline"
                        href={`https://dashboard.stripe.com/test/products/${value}`}
                    >
                        Ver no Stripe
                    </a>
                ),
                language: (value: string) => <span className="text-nowrap">{langsMap[value] ?? value}</span>,
                prevPrice: (value: number) => <span className="text-nowrap">R$ {value.toFixed(2)}</span>,
                price: (value: number, id: string, revalidateCache) => (
                    <BookPriceUpdate
                        DBValue={value}
                        id={id}
                        revalidateCache={revalidateCache}
                    ></BookPriceUpdate>
                ),
                stock: (value: number, id: string, revalidateCache) => (
                    <BookStockUpdate
                        DBValue={value}
                        id={id}
                        revalidateCache={revalidateCache}
                    ></BookStockUpdate>
                ),
            }}
            slug="book"
            inputKeyMap={inputKeyMap}
            formSchema={bookValidationSchema}
        ></SearchPage>
    )
}

import { type Prisma } from "prisma/prisma-client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PossibleDBOutput = Record<string, any>

export type CommonDBReturn<T> = {
    success: boolean
    errorMessage: string
    data: T | undefined
}

export type GetManyInput = {
    take: number
    skip: number
    searchTerm: string
}

export type GetManyOutput<T> = {
    total: number
    rows: T[]
}

export type BookGetManyOneRowOutput = {
    id: string
    price: number
    amount: number
    title: string
    descriptionTitle: string
    description: string
    pages: number
    publicationDate: Date
    isbn10Code: string
    isbn13Code: string
    width: number
    height: number
    length: number
    edition?: string
    categoryName: string
    publisherName: string
    languageName: string
    currencyLabel: string
    seriesName?: string
    mainImageUrl: string
    mainAuthorName: string
    mainTranslatorName: string
    stripeId: string
}

export type CommonSuggestion = {
    id: string
    name: string
}

export type CategoryPayload = Prisma.CategoryGetPayload<Prisma.CategoryDefaultArgs>
export type PublisherPayload = Prisma.PublisherGetPayload<Prisma.PublisherDefaultArgs>
export type LanguagePayload = Prisma.LanguageGetPayload<Prisma.LanguageDefaultArgs>
export type SeriesPayload = Prisma.SeriesGetPayload<Prisma.SeriesDefaultArgs>
export type CurrencyPayload = Prisma.CurrencyGetPayload<Prisma.CurrencyDefaultArgs>
export type AuthorPayload = Prisma.AuthorGetPayload<Prisma.AuthorDefaultArgs>
export type TranslatorPayload = Prisma.TranslatorGetPayload<Prisma.TranslatorDefaultArgs>

export type CategoryInput = Prisma.CategoryCreateInput
export type PublisherInput = Prisma.PublisherCreateInput
export type LanguageInput = Prisma.LanguageCreateInput
export type SeriesInput = Prisma.SeriesCreateInput
export type CurrencyInput = Prisma.CurrencyCreateInput
export type AuthorInput = Prisma.AuthorCreateInput
export type TranslatorInput = Prisma.TranslatorCreateInput

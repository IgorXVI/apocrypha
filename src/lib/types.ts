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
    isAvailable: boolean
    title: string
    description: string
    pages: number
    publicationDate: Date
    isbn10Code?: string
    isbn13Code?: string
    edition: number
    categoryName: string
    publisherName: string
    literatureType: string
    language: string
    seriesName?: string
    relatedBookTitle?: string
    mainImageUrl: string
    mainAuthorName: string
    mainTranslatorName: string
    stripeId: string
}

export type CommonSuggestion = {
    value: string
    label: string
}

export type CategoryPayload = Prisma.CategoryGetPayload<Prisma.CategoryDefaultArgs>
export type SuperCategoryPayload = Prisma.SuperCategoryGetPayload<Prisma.SuperCategoryDefaultArgs>
export type PublisherPayload = Prisma.PublisherGetPayload<Prisma.PublisherDefaultArgs>
export type SeriesPayload = Prisma.SeriesGetPayload<Prisma.SeriesDefaultArgs>
export type AuthorPayload = Prisma.AuthorGetPayload<Prisma.AuthorDefaultArgs>
export type TranslatorPayload = Prisma.TranslatorGetPayload<Prisma.TranslatorDefaultArgs>
export type BookPayload = Prisma.BookGetPayload<Prisma.BookDefaultArgs>

export type CategoryInput = Prisma.CategoryCreateInput
export type SuperCategoryInput = Prisma.SuperCategoryCreateInput
export type PublisherInput = Prisma.PublisherCreateInput
export type SeriesInput = Prisma.SeriesCreateInput
export type AuthorInput = Prisma.AuthorCreateInput
export type TranslatorInput = Prisma.TranslatorCreateInput

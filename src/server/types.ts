import { type Prisma } from "prisma/prisma-client"
import { type DefaultArgs } from "@prisma/client/runtime/library"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PossibleDBOutput = Record<string, any>

export type CommonDBReturn<T> = {
    success: boolean
    errorMessage: string
    data: T | undefined
}

export type AnyModel = Prisma.PublisherDelegate<DefaultArgs>

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
}

"use server"

import { type Prisma } from "prisma/prisma-client"

import { db } from "./db"
import { createAdminQueries, getSuggestions } from "./generic-queries"
import {
    type AuthorPayload,
    type CategoryPayload,
    type CurrencyPayload,
    type LanguagePayload,
    type PublisherPayload,
    type SeriesPayload,
    type TranslatorPayload,
    type AnyModel,
} from "./types"

const currencyAdminQueries = createAdminQueries<
    Prisma.CurrencyGetPayload<Prisma.CurrencyDefaultArgs>,
    Prisma.CurrencyScalarFieldEnum,
    Prisma.CurrencyCreateInput,
    Prisma.CurrencyUpdateInput
>(db.currency as unknown as AnyModel, "currency", ["iso4217Code", "label"])
export const currencyGetMany = async (...args: Parameters<typeof currencyAdminQueries.getMany>) => currencyAdminQueries.getMany(...args)
export const currencyGetOne = async (...args: Parameters<typeof currencyAdminQueries.getOne>) => currencyAdminQueries.getOne(...args)
export const currencyCreateOne = async (...args: Parameters<typeof currencyAdminQueries.createOne>) => currencyAdminQueries.createOne(...args)
export const currencyUpdateOne = async (...args: Parameters<typeof currencyAdminQueries.updateOne>) => currencyAdminQueries.updateOne(...args)
export const currencyDeleteOne = async (...args: Parameters<typeof currencyAdminQueries.deleteOne>) => currencyAdminQueries.deleteOne(...args)

const authorAdminQueries = createAdminQueries<
    Prisma.AuthorGetPayload<Prisma.AuthorDefaultArgs>,
    Prisma.AuthorScalarFieldEnum,
    Prisma.AuthorCreateInput,
    Prisma.AuthorUpdateInput
>(db.author as unknown as AnyModel, "author", ["about", "name"])
export const authorGetMany = async (...args: Parameters<typeof authorAdminQueries.getMany>) => authorAdminQueries.getMany(...args)
export const authorGetOne = async (...args: Parameters<typeof authorAdminQueries.getOne>) => authorAdminQueries.getOne(...args)
export const authorCreateOne = async (...args: Parameters<typeof authorAdminQueries.createOne>) => authorAdminQueries.createOne(...args)
export const authorUpdateOne = async (...args: Parameters<typeof authorAdminQueries.updateOne>) => authorAdminQueries.updateOne(...args)
export const authorDeleteOne = async (...args: Parameters<typeof authorAdminQueries.deleteOne>) => authorAdminQueries.deleteOne(...args)

const translatorAdminQueries = createAdminQueries<
    Prisma.TranslatorGetPayload<Prisma.TranslatorDefaultArgs>,
    Prisma.TranslatorScalarFieldEnum,
    Prisma.TranslatorCreateInput,
    Prisma.TranslatorUpdateInput
>(db.translator as unknown as AnyModel, "translator", ["name"])
export const translatorGetMany = async (...args: Parameters<typeof translatorAdminQueries.getMany>) => translatorAdminQueries.getMany(...args)
export const translatorGetOne = async (...args: Parameters<typeof translatorAdminQueries.getOne>) => translatorAdminQueries.getOne(...args)
export const translatorCreateOne = async (...args: Parameters<typeof translatorAdminQueries.createOne>) => translatorAdminQueries.createOne(...args)
export const translatorUpdateOne = async (...args: Parameters<typeof translatorAdminQueries.updateOne>) => translatorAdminQueries.updateOne(...args)
export const translatorDeleteOne = async (...args: Parameters<typeof translatorAdminQueries.deleteOne>) => translatorAdminQueries.deleteOne(...args)

const publisherAdminQueries = createAdminQueries<
    Prisma.PublisherGetPayload<Prisma.PublisherDefaultArgs>,
    Prisma.PublisherScalarFieldEnum,
    Prisma.PublisherCreateInput,
    Prisma.PublisherUpdateInput
>(db.publisher as unknown as AnyModel, "publisher", ["name"])
export const publisherGetMany = async (...args: Parameters<typeof publisherAdminQueries.getMany>) => publisherAdminQueries.getMany(...args)
export const publisherGetOne = async (...args: Parameters<typeof publisherAdminQueries.getOne>) => publisherAdminQueries.getOne(...args)
export const publisherCreateOne = async (...args: Parameters<typeof publisherAdminQueries.createOne>) => publisherAdminQueries.createOne(...args)
export const publisherUpdateOne = async (...args: Parameters<typeof publisherAdminQueries.updateOne>) => publisherAdminQueries.updateOne(...args)
export const publisherDeleteOne = async (...args: Parameters<typeof publisherAdminQueries.deleteOne>) => publisherAdminQueries.deleteOne(...args)

const seriesAdminQueries = createAdminQueries<
    Prisma.SeriesGetPayload<Prisma.SeriesDefaultArgs>,
    Prisma.SeriesScalarFieldEnum,
    Prisma.SeriesCreateInput,
    Prisma.SeriesUpdateInput
>(db.series as unknown as AnyModel, "series", ["name"])
export const seriesGetMany = async (...args: Parameters<typeof seriesAdminQueries.getMany>) => seriesAdminQueries.getMany(...args)
export const seriesGetOne = async (...args: Parameters<typeof seriesAdminQueries.getOne>) => seriesAdminQueries.getOne(...args)
export const seriesCreateOne = async (...args: Parameters<typeof seriesAdminQueries.createOne>) => seriesAdminQueries.createOne(...args)
export const seriesUpdateOne = async (...args: Parameters<typeof seriesAdminQueries.updateOne>) => seriesAdminQueries.updateOne(...args)
export const seriesDeleteOne = async (...args: Parameters<typeof seriesAdminQueries.deleteOne>) => seriesAdminQueries.deleteOne(...args)

const categoryAdminQueries = createAdminQueries<
    Prisma.CategoryGetPayload<Prisma.CategoryDefaultArgs>,
    Prisma.CategoryScalarFieldEnum,
    Prisma.CategoryCreateInput,
    Prisma.CategoryUpdateInput
>(db.category as unknown as AnyModel, "category", ["name"])
export const categoryGetMany = async (...args: Parameters<typeof categoryAdminQueries.getMany>) => categoryAdminQueries.getMany(...args)
export const categoryGetOne = async (...args: Parameters<typeof categoryAdminQueries.getOne>) => categoryAdminQueries.getOne(...args)
export const categoryCreateOne = async (...args: Parameters<typeof categoryAdminQueries.createOne>) => categoryAdminQueries.createOne(...args)
export const categoryUpdateOne = async (...args: Parameters<typeof categoryAdminQueries.updateOne>) => categoryAdminQueries.updateOne(...args)
export const categoryDeleteOne = async (...args: Parameters<typeof categoryAdminQueries.deleteOne>) => categoryAdminQueries.deleteOne(...args)

const languageAdminQueries = createAdminQueries<
    Prisma.LanguageGetPayload<Prisma.LanguageDefaultArgs>,
    Prisma.LanguageScalarFieldEnum,
    Prisma.LanguageCreateInput,
    Prisma.LanguageUpdateInput
>(db.language as unknown as AnyModel, "language", ["name", "iso6391Code", "iso6392Code"])
export const languageGetMany = async (...args: Parameters<typeof languageAdminQueries.getMany>) => languageAdminQueries.getMany(...args)
export const languageGetOne = async (...args: Parameters<typeof languageAdminQueries.getOne>) => languageAdminQueries.getOne(...args)
export const languageCreateOne = async (...args: Parameters<typeof languageAdminQueries.createOne>) => languageAdminQueries.createOne(...args)
export const languageUpdateOne = async (...args: Parameters<typeof languageAdminQueries.updateOne>) => languageAdminQueries.updateOne(...args)
export const languageDeleteOne = async (...args: Parameters<typeof languageAdminQueries.deleteOne>) => languageAdminQueries.deleteOne(...args)

export const getCategorySuggestions = getSuggestions<CategoryPayload>(db.category as unknown as AnyModel, "name")
export const getPublisherSuggestions = getSuggestions<PublisherPayload>(db.publisher as unknown as AnyModel, "name")
export const getLanguageSuggestions = getSuggestions<LanguagePayload>(db.language as unknown as AnyModel, "name")
export const getSeriesSuggestions = getSuggestions<SeriesPayload>(db.series as unknown as AnyModel, "name")
export const getCurrencySuggestions = getSuggestions<CurrencyPayload>(db.currency as unknown as AnyModel, "iso4217Code")
export const getAuthorSuggestions = getSuggestions<AuthorPayload>(db.author as unknown as AnyModel, "name")
export const getTranslatorSuggestions = getSuggestions<TranslatorPayload>(db.translator as unknown as AnyModel, "name")

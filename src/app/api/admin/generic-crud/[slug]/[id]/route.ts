import { db } from "~/server/db"
import { getOne, createOne, updateOne, deleteOne } from "~/server/generic-queries"
import {
    type CategoryInput,
    type PublisherInput,
    type LanguageInput,
    type SeriesInput,
    type CurrencyInput,
    type AuthorInput,
    type TranslatorInput,
    type CommonDBReturn,
} from "~/server/types"

const currencyGetOne = getOne<CurrencyInput>(db.currency)
const currencyCreateOne = createOne<CurrencyInput>(db.currency, "currency")
const currencyUpdateOne = updateOne<CurrencyInput>(db.currency, "currency")
const currencyDeleteOne = deleteOne(db.currency, "currency")

const authorGetOne = getOne<AuthorInput>(db.author)
const authorCreateOne = createOne<AuthorInput>(db.author, "author")
const authorUpdateOne = updateOne<AuthorInput>(db.author, "author")
const authorDeleteOne = deleteOne(db.author, "author")

const translatorGetOne = getOne<TranslatorInput>(db.translator)
const translatorCreateOne = createOne<TranslatorInput>(db.translator, "translator")
const translatorUpdateOne = updateOne<TranslatorInput>(db.translator, "translator")
const translatorDeleteOne = deleteOne(db.translator, "translator")

const publisherGetOne = getOne<PublisherInput>(db.publisher)
const publisherCreateOne = createOne<PublisherInput>(db.publisher, "publisher")
const publisherUpdateOne = updateOne<PublisherInput>(db.publisher, "publisher")
const publisherDeleteOne = deleteOne(db.publisher, "publisher")

const seriesGetOne = getOne<SeriesInput>(db.series)
const seriesCreateOne = createOne<SeriesInput>(db.series, "series")
const seriesUpdateOne = updateOne<SeriesInput>(db.series, "series")
const seriesDeleteOne = deleteOne(db.series, "series")

const categoryGetOne = getOne<CategoryInput>(db.category)
const categoryCreateOne = createOne<CategoryInput>(db.category, "category")
const categoryUpdateOne = updateOne<CategoryInput>(db.category, "category")
const categoryDeleteOne = deleteOne(db.category, "category")

const languageGetOne = getOne<LanguageInput>(db.language)
const languageCreateOne = createOne<LanguageInput>(db.language, "language")
const languageUpdateOne = updateOne<LanguageInput>(db.language, "language")
const languageDeleteOne = deleteOne(db.language, "language")

export async function GET(_: Request, { params: { slug, id } }: { params: { slug: string; id: string } }) {
    let dbQuery: (id: string) => Promise<CommonDBReturn<unknown>>
    switch (slug) {
        case "currency":
            dbQuery = currencyGetOne
            break
        case "author":
            dbQuery = authorGetOne
            break
        case "translator":
            dbQuery = translatorGetOne
            break
        case "publisher":
            dbQuery = publisherGetOne
            break
        case "series":
            dbQuery = seriesGetOne
            break
        case "category":
            dbQuery = categoryGetOne
            break
        case "language":
            dbQuery = languageGetOne
            break
        default:
            dbQuery = async () => {
                return {
                    data: undefined,
                    success: false,
                    errorMessage: "Invalid slug",
                }
            }
    }

    const result = await dbQuery(id)

    if (!result.success) {
        return Response.json(
            {
                errorMessage: result.errorMessage,
            },
            {
                status: 500,
            },
        )
    }

    return Response.json(result.data)
}

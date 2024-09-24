import { db } from "~/server/db"
import { getMany } from "~/server/generic-queries"
import {
    type CommonDBReturn,
    type AuthorPayload,
    type CategoryPayload,
    type CurrencyPayload,
    type LanguagePayload,
    type PublisherPayload,
    type SeriesPayload,
    type TranslatorPayload,
    type GetManyOutput,
    type GetManyInput,
} from "~/server/types"

const currencyGetMany = getMany<CurrencyPayload>(db.currency, "iso4217Code")

const authorGetMany = getMany<AuthorPayload>(db.author, "name")

const translatorGetMany = getMany<TranslatorPayload>(db.translator, "name")

const publisherGetMany = getMany<PublisherPayload>(db.publisher, "name")

const seriesGetMany = getMany<SeriesPayload>(db.series, "name")

const categoryGetMany = getMany<CategoryPayload>(db.category, "name")

const languageGetMany = getMany<LanguagePayload>(db.language, "name")

export async function GET(req: Request, { params: { slug } }: { params: { slug: string } }) {
    let dbQuery: (input: GetManyInput) => Promise<CommonDBReturn<GetManyOutput<unknown>>>
    switch (slug) {
        case "currency":
            dbQuery = currencyGetMany
            break
        case "author":
            dbQuery = authorGetMany
            break
        case "translator":
            dbQuery = translatorGetMany
            break
        case "publisher":
            dbQuery = publisherGetMany
            break
        case "series":
            dbQuery = seriesGetMany
            break
        case "category":
            dbQuery = categoryGetMany
            break
        case "language":
            dbQuery = languageGetMany
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

    const queryParams = new URLSearchParams(new URL(req.url).search)

    const result = await dbQuery({
        searchTerm: queryParams.get("searchTerm") ?? "",
        take: Number(queryParams.get("take")) || 10,
        skip: Number(queryParams.get("skip")) || 0,
    })

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

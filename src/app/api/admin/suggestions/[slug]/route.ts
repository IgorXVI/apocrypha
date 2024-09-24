import { db } from "~/server/db"
import { getSuggestions } from "~/server/generic-queries"
import {
    type AuthorPayload,
    type CategoryPayload,
    type CurrencyPayload,
    type LanguagePayload,
    type PublisherPayload,
    type SeriesPayload,
    type TranslatorPayload,
} from "~/server/types"

export const decideQueries = (slug: string) => {
    switch (slug) {
        case "currency":
            return {
                getSuggestions: getSuggestions<CurrencyPayload>(db.currency, "iso4217Code"),
            }
        case "author":
            return {
                getSuggestions: getSuggestions<AuthorPayload>(db.author, "name"),
            }
        case "translator":
            return {
                getSuggestions: getSuggestions<TranslatorPayload>(db.translator, "name"),
            }
        case "publisher":
            return {
                getSuggestions: getSuggestions<PublisherPayload>(db.publisher, "name"),
            }
        case "series":
            return {
                getSuggestions: getSuggestions<SeriesPayload>(db.series, "name"),
            }
        case "category":
            return {
                getSuggestions: getSuggestions<CategoryPayload>(db.category, "name"),
            }
        case "language":
            return {
                getSuggestions: getSuggestions<LanguagePayload>(db.language, "name"),
            }
        default: {
            return {
                getSuggestions: async () => ({
                    data: undefined,
                    success: false,
                    errorMessage: "Invalid slug",
                }),
            }
        }
    }
}

export async function GET(req: Request, { params: { slug } }: { params: { slug: string } }) {
    const queryParams = new URLSearchParams(new URL(req.url).search)

    const paramsId = queryParams.get("id")

    const id = paramsId && paramsId !== "" ? paramsId : undefined

    const result = await decideQueries(slug).getSuggestions(queryParams.get("searchTerm") ?? "", id)

    if (!result.success) {
        return Response.json(
            {
                success: false,
                errorMessage: result.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json({
        success: true,
        data: result.data,
    })
}

import { db } from "~/server/db"
import { getSuggestions } from "~/server/generic-queries"
import {
    type BookPayload,
    type AuthorPayload,
    type PublisherPayload,
    type SeriesPayload,
    type TranslatorPayload,
    type CommonSuggestion,
} from "~/lib/types"
import { getSuperCategoryCompositeSuggestions } from "~/server/category-queries"

export const decideQueries = (slug: string) => {
    switch (slug) {
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
        case "book":
            return {
                getSuggestions: getSuggestions<BookPayload>(db.book, "title"),
            }
        case "super-category-composite": {
            return {
                getSuggestions: getSuperCategoryCompositeSuggestions,
            }
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

export type GETApiSuggestionInput = {
    slug: string
    searchTerm?: string
    ids?: string[]
}

export type GETApiSuggestionOutput =
    | {
          success: true
          data: CommonSuggestion[]
      }
    | {
          success: false
          errorMessage: string
      }

export async function GET(req: Request, { params: { slug } }: { params: { slug: string } }) {
    const queryParams = new URLSearchParams(new URL(req.url).search)

    const paramsIds = queryParams.get("ids")

    const ids = paramsIds && paramsIds !== "" ? paramsIds.split(",") : undefined

    const result = await decideQueries(slug).getSuggestions(queryParams.get("searchTerm") ?? "", ids)

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

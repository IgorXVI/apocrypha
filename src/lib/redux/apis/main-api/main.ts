import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { type CommonSuggestion } from "~/lib/types"

type GetSuggestionsInput = {
    slug: string
    searchTerm: string
    ids?: string[]
}

type GetSuggestionsOutput = {
    success: boolean
    data: CommonSuggestion[]
}

export const mainApi = createApi({
    reducerPath: "mainApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "same-origin" }),
    endpoints: (builder) => ({
        getSuggestions: builder.query<GetSuggestionsOutput, GetSuggestionsInput>({
            query: ({ slug, searchTerm = "", ids }) => {
                const params = new URLSearchParams({
                    ids: ids?.join(",") ?? "",
                    searchTerm,
                })

                return {
                    url: `admin/suggestions/${slug}?${params.toString()}`,
                }
            },
        }),
    }),
})

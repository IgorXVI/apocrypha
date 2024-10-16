import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
    type DELETEApiGenericCrudDeleteOneInput,
    type DELETEApiGenericCrudDeleteOneOutput,
    type PATCHApiGenericCrudUpdateOneInput,
    type PATCHApiGenericCrudUpdateOneOutput,
    type GETApiGenericCrudGetOneInput,
    type GETApiGenericCrudGetOneOutput,
} from "~/app/api/admin/generic-crud/[slug]/[id]/route"
import {
    type GETApiGenericCrudGetManyInput,
    type GETApiGenericCrudGetManyOutput,
    type POSTApiGenericCrudCreateOneInput,
    type POSTApiGenericCrudCreateOneOutput,
} from "~/app/api/admin/generic-crud/[slug]/route"
import { type GETApiSuggestionOutput, type GETApiSuggestionInput } from "~/app/api/admin/suggestions/[slug]/route"
import { type POSTApiCheckoutInput, type POSTApiCheckoutOutput } from "~/app/api/checkout/route"
import { type GETApiUserAddressOutput, type POSTApiUserAddressInput, type POSTApiUserAddressOutput } from "~/app/api/user/address/route"
import { type GETApiUserStateOutput, type POSTApiUserStateInput, type POSTApiUserStateOutput } from "~/app/api/user/state/route"

export const mainApi = createApi({
    reducerPath: "mainApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "same-origin" }),
    endpoints: (builder) => ({
        getSuggestions: builder.query<GETApiSuggestionOutput, GETApiSuggestionInput>({
            query: ({ slug, searchTerm, ids }) => {
                const params = new URLSearchParams({
                    ids: ids?.join(",") ?? "",
                    searchTerm: searchTerm ?? "",
                })

                return {
                    url: `admin/suggestions/${slug}?${params.toString()}`,
                }
            },
        }),
        getOne: builder.query<GETApiGenericCrudGetOneOutput, GETApiGenericCrudGetOneInput>({
            query: ({ slug, id }) => {
                return {
                    url: `admin/${slug}/${id}`,
                }
            },
        }),
        deleteOne: builder.mutation<DELETEApiGenericCrudDeleteOneOutput, DELETEApiGenericCrudDeleteOneInput>({
            query: ({ slug, id }) => {
                return {
                    url: `admin/${slug}/${id}`,
                    method: "DELETE",
                }
            },
        }),
        updateOne: builder.mutation<PATCHApiGenericCrudUpdateOneOutput, PATCHApiGenericCrudUpdateOneInput>({
            query: ({ slug, id, data }) => {
                return {
                    url: `admin/${slug}/${id}`,
                    method: "PATCH",
                    body: data,
                }
            },
        }),
        createOne: builder.mutation<POSTApiGenericCrudCreateOneOutput, POSTApiGenericCrudCreateOneInput>({
            query: ({ slug, data }) => {
                return {
                    url: `admin/${slug}`,
                    method: "POST",
                    body: data,
                }
            },
        }),
        getMany: builder.query<GETApiGenericCrudGetManyOutput, GETApiGenericCrudGetManyInput>({
            query: ({ slug, searchTerm, take, skip }) => {
                const params = new URLSearchParams({
                    searchTerm: searchTerm ?? "",
                    take: take?.toString() ?? "",
                    skip: skip?.toString() ?? "",
                })

                return {
                    url: `admin/${slug}?${params.toString()}`,
                }
            },
        }),
        checkout: builder.mutation<POSTApiCheckoutOutput, POSTApiCheckoutInput>({
            query: ({ data }) => {
                return {
                    url: "checkout",
                    method: "POST",
                    body: data,
                }
            },
        }),
        getUserAddress: builder.query<GETApiUserAddressOutput, undefined>({
            query: () => ({ url: "user/address" }),
        }),
        saveUserAddress: builder.mutation<POSTApiUserAddressOutput, POSTApiUserAddressInput>({
            query: ({ data }) => ({
                url: "user/address",
                method: "POST",
                body: data,
            }),
        }),
        getUserState: builder.query<GETApiUserStateOutput, undefined>({
            query: () => ({ url: "user/state" }),
        }),
        saveUserState: builder.mutation<POSTApiUserStateOutput, POSTApiUserStateInput>({
            query: ({ data }) => ({
                url: "user/state",
                method: "POST",
                body: data,
            }),
        }),
    }),
})

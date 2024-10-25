import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { env } from "~/env"
import { type CepResponse } from "~/lib/types"

export const brasilApi = createApi({
    reducerPath: "brasilApi",
    baseQuery: fetchBaseQuery({ baseUrl: env.NEXT_PUBLIC_BRASIL_API, credentials: "omit" }),
    endpoints: (builder) => ({
        getCepInfo: builder.query<CepResponse, string>({
            query: (cep: string) => ({ url: `cep/v1/${cep}` }),
        }),
    }),
})

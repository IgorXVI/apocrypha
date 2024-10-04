import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

type CepResponse = {
    cep: string
    state: string
    city: string
    neighborhood: string
    street: string
    service: string
}

export const brasilApi = createApi({
    reducerPath: "brasilApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://brasilapi.com.br/api/", credentials: "omit" }),
    endpoints: (builder) => ({
        getCepInfo: builder.query<CepResponse, string>({
            query: (cep: string) => ({ url: `cep/v1/${cep}` }),
        }),
    }),
})

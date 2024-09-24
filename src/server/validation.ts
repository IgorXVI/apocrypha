import { z } from "zod"

export const translatorValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Nome deve ter ao menos 3 caracteres.",
        })
        .default(""),
})

export type TranslatorSchemaType = z.infer<typeof translatorValidationSchema>

export const seriesValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Nome deve ter ao menos 3 caracteres.",
        })
        .default(""),
})

export type SeriesSchemaType = z.infer<typeof seriesValidationSchema>

export const publisherValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Nome deve ter ao menos 3 caracteres.",
        })
        .default(""),
})

export type PublisherSchemaType = z.infer<typeof publisherValidationSchema>

export const languageValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Prefixo deve ter ao menos 1 caracter.",
        })
        .default(""),
    iso6392Code: z
        .string()
        .length(3, {
            message: "Código ISO 6392 deve ter 3 caracteres.",
        })
        .default(""),
    iso6391Code: z
        .string()
        .length(2, {
            message: "Código ISO 6391 deve ter 2 caracteres.",
        })
        .default(""),
})

export type LanguageSchemaType = z.infer<typeof languageValidationSchema>

export const currencyValidationSchema = z.object({
    label: z
        .string()
        .min(1, {
            message: "Prefixo deve ter ao menos 1 caracter.",
        })
        .max(5, {
            message: "Prefixo deve ter no máximo 5 caracteres.",
        })
        .default(""),
    iso4217Code: z
        .string()
        .min(3, {
            message: "Código ISO 4217 deve ter ao menos 3 caracteres.",
        })
        .max(4, {
            message: "Código ISO 4217 deve ter no máximo 4 caracteres.",
        })
        .default(""),
})

export type CurrencySchemaType = z.infer<typeof currencyValidationSchema>

export const categoryValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Nome deve ter ao menos 3 caracteres.",
        })
        .default(""),
    iconUrl: z.string().url("Selecione uma imagem.").default(""),
})

export type CategorySchemaType = z.infer<typeof categoryValidationSchema>

export const bookValidationSchema = z.object({
    price: z.number().positive({ message: "O preço deve ser um número positivo." }).default(0),
    amount: z.number().int().positive({ message: "A quantidade deve ser um número inteiro positivo." }).default(0),
    title: z.string().min(1, { message: "O título é obrigatório." }).default(""),
    descriptionTitle: z
        .string({ required_error: "O título da descrição é obrigatório." })
        .max(100, {
            message: "Título da descrição deve ter no máximo 100 caracteres.",
        })
        .default(""),
    description: z.string({ required_error: "A descrição é obrigatória." }).default(""),
    pages: z.number().int().positive({ message: "O número de páginas deve ser um número inteiro positivo." }).default(0),
    publicationDate: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date({ required_error: "A data de publicação é obrigatória." }),
    ),
    isbn10Code: z.string().length(10, { message: "O ISBN-10 deve ter exatamente 10 caracteres." }).default(""),
    isbn13Code: z.string().length(13, { message: "O ISBN-13 deve ter exatamente 13 caracteres." }).default(""),
    width: z.number().positive({ message: "A largura deve ser um número positivo." }).default(0),
    height: z.number().positive({ message: "A altura deve ser um número positivo." }).default(0),
    length: z.number().positive({ message: "O comprimento deve ser um número positivo." }).default(0),
    edition: z.string().optional(),
    categoryId: z.string().uuid({ message: "O ID da categoria é inválido." }).default(""),
    publisherId: z.string().uuid({ message: "O ID da editora é inválido." }).default(""),
    languageId: z.string().uuid({ message: "O ID do idioma é inválido." }).default(""),
    currencyId: z.string().uuid({ message: "O ID da moeda é inválido." }).default(""),
    seriesId: z.string().uuid({ message: "O ID da série é inválido." }).optional(),
    imgUrls: z.array(z.string().url({ message: "URL da imagem inválida." })).default([]),
    mainImgUrl: z.string().url({ message: "URL da imagem inválida." }).default(""),
    authorId: z.string().uuid({ message: "ID do autor inválido." }).default(""),
    translatorId: z.string().uuid({ message: "ID do tradutor inválido." }).default(""),
})

export type BookSchemaType = z.infer<typeof bookValidationSchema>

export const authorValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Nome deve ter ao menos 3 caracteres.",
        })
        .default(""),
    about: z
        .string()
        .min(5, {
            message: "Sobre deve ter ao menos 5 caracteres.",
        })
        .default(""),
    imgUrl: z.string().url("Selecione uma imagem.").default(""),
})

export type AuthorSchemaType = z.infer<typeof authorValidationSchema>

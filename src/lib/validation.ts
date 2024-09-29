import { Langs, LiteratureType } from "@prisma/client"
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
    isAvailable: z.boolean().default(true),
    title: z.string().min(1, { message: "O título é obrigatório." }).default(""),
    description: z.string({ required_error: "A descrição é obrigatória." }).default(""),
    pages: z.number().int().positive({ message: "O número de páginas deve ser um número inteiro positivo." }).default(0),
    publicationDate: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date({ required_error: "A data de publicação é obrigatória." }),
    ),
    isbn10Code: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().length(10, { message: "O ISBN-10 deve ter exatamente 10 caracteres." }).optional(),
    ),
    isbn13Code: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().length(13, { message: "O ISBN-13 deve ter exatamente 13 caracteres." }).optional(),
    ),
    edition: z.number().int().positive({ message: "A edição deve ser um número inteiro positivo." }).default(1),

    literatureType: z.nativeEnum(LiteratureType).optional(),
    language: z.nativeEnum(Langs).optional(),

    imgUrls: z.array(z.string().url({ message: "URL da imagem inválida." })).default([]),
    mainImgUrl: z.string().url({ message: "URL da imagem inválida." }).default(""),

    categoryId: z.string().uuid({ message: "O ID da categoria é inválido." }).default(""),
    publisherId: z.string().uuid({ message: "O ID da editora é inválido." }).default(""),
    seriesId: z.string().uuid({ message: "O ID da série é inválido." }).optional(),

    authorIds: z.array(z.string().uuid({ message: "ID do autor inválido." })).default([]),
    translatorIds: z.array(z.string().uuid({ message: "ID do tradutor inválido." })).default([]),

    mainAuthorId: z.string().uuid({ message: "ID do autor inválido." }).default(""),
    mainTranslatorId: z.string().uuid({ message: "ID do tradutor inválido." }).default(""),

    relatedBookId: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().uuid({ message: "ID do livro relacionado inválido." }).optional(),
    ),
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

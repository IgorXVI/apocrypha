import { Langs } from "@prisma/client"
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
    superCategoryId: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().uuid({ message: "O ID da categoria mãe é inválido." }).optional(),
    ),
})

export type CategorySchemaType = z.infer<typeof categoryValidationSchema>

export const superCategoryValidationSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: "Nome deve ter ao menos 3 caracteres.",
        })
        .default(""),
    iconSvg: z
        .string()
        .min(10, {
            message: "SVG deve ter ao menos 10 caracteres.",
        })
        .default(""),
})

export type SuperCategorySchemaType = z.infer<typeof superCategoryValidationSchema>

export const bookValidationSchema = z.object({
    price: z.number().positive({ message: "O preço deve ser um número positivo." }).default(0),
    stock: z.number().nonnegative({ message: "A quantidade em estoque deve ser um número positivo ou zero." }).default(0),
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

    heightCm: z.number().positive({ message: "A altura deve ser um número positivo." }).default(0),
    widthCm: z.number().positive({ message: "A largura deve ser um número positivo." }).default(0),
    thicknessCm: z.number().positive({ message: "A grossura deve ser um número positivo." }).default(0),
    weightGrams: z.number().positive({ message: "O peso deve ser um número positivo." }).default(0),

    language: z.nativeEnum(Langs).optional(),

    imgUrls: z.array(z.string().url({ message: "URL da imagem inválida." })).default([]),
    mainImgUrl: z.string().url({ message: "URL da imagem inválida." }).default(""),

    publisherId: z.string().uuid({ message: "O ID da editora é inválido." }).default(""),
    seriesId: z.string().uuid({ message: "O ID da série é inválido." }).optional(),
    placeInSeries: z.number().int().nonnegative({ message: "A posição na série deve ser um número inteiro positivo." }).default(0),

    authorIds: z.array(z.string().uuid({ message: "ID do autor inválido." })).default([]),
    translatorIds: z.array(z.string().uuid({ message: "ID do tradutor inválido." })).default([]),
    categoryIds: z.array(z.string().uuid({ message: "ID da categoria inválido." })).default([]),

    mainAuthorId: z.string().uuid({ message: "ID do autor inválido." }).default(""),
    mainTranslatorId: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().uuid({ message: "ID do tradutor inválido." }).optional(),
    ),
    mainCategoryId: z.string().uuid({ message: "ID da categoria inválido." }).default(""),

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

export const reviewValidationSchema = z.object({
    title: z
        .string({ message: "Título deve ser uma string." })
        .min(2, { message: "Título deve ter ao menos 2 caracteres." })
        .max(100, { message: "Título deve ter no máximo 100 caracteres." }),
    body: z
        .string({ message: "Texto da avaliação deve ser uma string." })
        .min(2, { message: "Texto da avaliação deve ter ao menos 2 caracteres." })
        .max(500, { message: "Texto da avaliação deve ter no máximo 500 caracteres." }),
    rating: z
        .number({ message: "Quantidade de estrelas deve ser um número." })
        .int({ message: "Quantidade de estrelas deve ser um número inteiro." })
        .gte(1, { message: "Quantidade de estrelas deve ser um número maior ou igual a 1." })
        .lte(5, { message: "Quantidade de estrelas deve ser um número menor ou igual a 5." }),
    bookId: z.string({ message: "ID do livro deve ser uma string." }).uuid({ message: "ID do livro deve ser um UUID." }),
})

export type ReviewSchemaType = z.infer<typeof reviewValidationSchema>

export const userAddressValidationSchema = z.object({
    cep: z.preprocess(
        (value) => (typeof value === "string" ? value.replace("-", "") : value),
        z
            .string()
            .min(8, {
                message: "CEP deve ter no mínimo 8 dígitos.",
            })
            .max(8, {
                message: "CEP deve ter no máximo 8 dígitos.",
            })
            .default(""),
    ),
    number: z.preprocess(
        (value) => (typeof value === "string" ? Number(value) : value),
        z.number().int().positive({ message: "Número deve ser positivo." }).default(0),
    ),
    complement: z
        .string()
        .min(2, {
            message: "Complemento deve ter no mínimo 2 letras.",
        })
        .optional(),
})

export type UserAddressSchemaType = z.infer<typeof userAddressValidationSchema>

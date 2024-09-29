"server-only"

import { type Prisma } from "prisma/prisma-client"
import { type CommonDBReturn, type GetManyInput, type GetManyOutput } from "../lib/types"
import { type DefaultArgs } from "@prisma/client/runtime/library"
import { db } from "./db"

type AnyModel =
    | Prisma.PublisherDelegate<DefaultArgs>
    | Prisma.AuthorDelegate<DefaultArgs>
    | Prisma.TranslatorDelegate<DefaultArgs>
    | Prisma.CategoryDelegate<DefaultArgs>
    | Prisma.SeriesDelegate<DefaultArgs>
    | Prisma.BookDelegate<DefaultArgs>
    | Prisma.SuperCategoryDelegate<DefaultArgs>
type PrivateAnyModel = Prisma.AuthorDelegate<DefaultArgs>

export async function errorHandler<T>(fun: () => Promise<T>): Promise<CommonDBReturn<T>> {
    try {
        const result = await fun()

        return {
            success: true,
            errorMessage: "",
            data: result,
        }
    } catch (e) {
        console.error(e)

        let errorMessage = (e as Error).message

        if (errorMessage.includes("Foreign key constraint failed on the field: `")) {
            errorMessage =
                errorMessage
                    .replace(
                        "Foreign key constraint failed on the field: `",
                        "There are related records in the database that must be deleted first: ",
                    )
                    .split("_")[0] ?? errorMessage
        }

        return {
            success: false,
            errorMessage,
            data: undefined,
        }
    }
}

export const createOne =
    <T>(model: AnyModel) =>
    (data: T) =>
        errorHandler(async () => {
            await (model as PrivateAnyModel).create({
                data: data as Prisma.AuthorCreateInput,
            })

            return undefined
        })

export const updateOne =
    <T>(model: AnyModel) =>
    (id: string, data: T) =>
        errorHandler(async () => {
            await (model as PrivateAnyModel).update({
                data: data as Prisma.AuthorUpdateInput,
                where: {
                    id,
                },
            })

            return undefined
        })

export const deleteOne = (model: AnyModel) => (id: string) =>
    errorHandler(async () => {
        await (model as PrivateAnyModel).delete({
            where: {
                id,
            },
        })

        return undefined
    })

export const getOne =
    <T>(model: AnyModel) =>
    (id: string) =>
        errorHandler(async () => {
            const row = await (model as PrivateAnyModel).findUnique({
                where: {
                    id,
                },
            })

            if (!row) {
                throw new Error("Not found")
            }

            return row as T
        })

export const getMany =
    <T, K = never>(model: AnyModel, searchAttr: keyof T, include?: K) =>
    (input: GetManyInput): Promise<CommonDBReturn<GetManyOutput<T>>> =>
        errorHandler(async () => {
            const [rows, total] = await db.$transaction([
                (model as PrivateAnyModel).findMany({
                    take: input.take,
                    skip: input.skip,
                    where: {
                        [searchAttr]: {
                            startsWith: input.searchTerm,
                        },
                    },
                    include: include as Prisma.AuthorInclude,
                }),
                (model as PrivateAnyModel).count({
                    where: {
                        [searchAttr]: {
                            startsWith: input.searchTerm,
                        },
                    },
                }),
            ])

            return {
                total,
                rows: rows as T[],
            }
        })

interface HasId {
    id: string
}

export const getSuggestions =
    <T extends HasId>(model: AnyModel, searchAttr: keyof T) =>
    async (searchTerm: string, ids?: string[]) =>
        errorHandler(async () => {
            let suggestions = await (model as PrivateAnyModel).findMany({
                where: {
                    [searchAttr]: {
                        contains: searchTerm,
                        mode: "insensitive",
                    },
                },
                select: {
                    id: true,
                    [searchAttr]: true,
                },
                take: 5,
            })

            if (ids && !suggestions.some((suggestion) => ids.includes(suggestion.id as unknown as string))) {
                const suggenstionWithId = await (model as PrivateAnyModel).findMany({
                    where: {
                        id: {
                            in: ids,
                        },
                    },
                    select: {
                        id: true,
                        [searchAttr]: true,
                    },
                    take: 20,
                })

                if (suggenstionWithId) {
                    suggestions = [...suggenstionWithId, ...suggestions]
                }
            }

            return (suggestions as unknown as T[]).map((suggestion) => ({
                value: suggestion.id,
                label: suggestion[searchAttr] ?? "",
            }))
        })

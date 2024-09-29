import { z } from "zod"
import { db } from "~/server/db"
import { getMany, createOne, getOne, updateOne, deleteOne } from "~/server/generic-queries"
import {
    type AuthorPayload,
    type CategoryPayload,
    type PublisherPayload,
    type SeriesPayload,
    type TranslatorPayload,
    type AuthorInput,
    type TranslatorInput,
    type PublisherInput,
    type SeriesInput,
    type CategoryInput,
} from "~/lib/types"
import {
    authorValidationSchema,
    translatorValidationSchema,
    publisherValidationSchema,
    seriesValidationSchema,
    categoryValidationSchema,
} from "~/lib/validation"

export const decideQueries = (slug: string) => {
    switch (slug) {
        case "author":
            return {
                getMany: getMany<AuthorPayload>(db.author, "name"),
                createOne: createOne<AuthorInput>(db.author),
                getOne: getOne<AuthorInput>(db.author),
                updateOne: updateOne<AuthorInput>(db.author),
                deleteOne: deleteOne(db.author),
                validationSchema: authorValidationSchema,
            }
        case "translator":
            return {
                getMany: getMany<TranslatorPayload>(db.translator, "name"),
                createOne: createOne<TranslatorInput>(db.translator),
                getOne: getOne<TranslatorInput>(db.translator),
                updateOne: updateOne<TranslatorInput>(db.translator),
                deleteOne: deleteOne(db.translator),
                validationSchema: translatorValidationSchema,
            }
        case "publisher":
            return {
                getMany: getMany<PublisherPayload>(db.publisher, "name"),
                createOne: createOne<PublisherInput>(db.publisher),
                getOne: getOne<PublisherInput>(db.publisher),
                updateOne: updateOne<PublisherInput>(db.publisher),
                deleteOne: deleteOne(db.publisher),
                validationSchema: publisherValidationSchema,
            }
        case "series":
            return {
                getMany: getMany<SeriesPayload>(db.series, "name"),
                createOne: createOne<SeriesInput>(db.series),
                getOne: getOne<SeriesInput>(db.series),
                updateOne: updateOne<SeriesInput>(db.series),
                deleteOne: deleteOne(db.series),
                validationSchema: seriesValidationSchema,
            }
        case "category":
            return {
                getMany: getMany<CategoryPayload>(db.category, "name"),
                createOne: createOne<CategoryInput>(db.category),
                getOne: getOne<CategoryInput>(db.category),
                updateOne: updateOne<CategoryInput>(db.category),
                deleteOne: deleteOne(db.category),
                validationSchema: categoryValidationSchema,
            }
        default: {
            const defaultResult = {
                data: undefined,
                success: false,
                errorMessage: "Invalid slug",
            }

            return {
                getMany: async () => defaultResult,
                createOne: async () => defaultResult,
                getOne: async () => defaultResult,
                updateOne: async () => defaultResult,
                deleteOne: async () => defaultResult,
                validationSchema: z.object({}),
            }
        }
    }
}

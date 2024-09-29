"server-only"

import { type CommonDBReturn, type CommonSuggestion } from "~/lib/types"
import { db } from "./db"
import { errorHandler } from "./generic-queries"

export const getSuperCategoryCompositeSuggestions = async (searchTerm: string, ids?: string[]): Promise<CommonDBReturn<CommonSuggestion[]>> =>
    errorHandler(async () => {
        const include = {
            SuperCategory: {
                select: {
                    name: true,
                },
            },
        }

        let suggestions = await db.category.findMany({
            where: {
                name: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            },
            include,
            take: 10,
        })

        if (ids && !suggestions.some((suggestion) => ids.includes(suggestion.id))) {
            const suggenstionWithId = await db.category.findMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
                include,
                take: 20,
            })

            if (suggenstionWithId) {
                suggestions = [...suggenstionWithId, ...suggestions]
            }
        }

        return suggestions.map((s) => ({
            value: s.id,
            label: `${s.SuperCategory?.name ?? "N/A"}->${s.name}`,
        }))
    })

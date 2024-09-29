"server-only"

import { type CommonDBReturn, type CommonSuggestion } from "~/lib/types"
import { db } from "./db"
import { errorHandler } from "./generic-queries"

export const getSuperCategoryCompositeSuggestions = async (searchTerm: string, ids?: string[]): Promise<CommonDBReturn<CommonSuggestion[]>> =>
    errorHandler(async () => {
        const categories = await db.category.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    {
                        id: {
                            in: ids,
                        },
                    },
                ],
            },
            include: {
                SuperCategory: {
                    select: {
                        name: true,
                    },
                },
            },
            take: 10,
        })

        return categories.map((category) => ({
            value: category.id,
            label: `${category.SuperCategory?.name ?? "N/A"}->${category.name}`,
        }))
    })

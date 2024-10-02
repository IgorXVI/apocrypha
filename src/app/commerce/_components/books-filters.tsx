"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"

export function BooksFilters(props: {
    superCategories: {
        id: string
        name: string
    }[]
    categories: {
        id: string
        name: string
    }[]
    selectedSuperCategoryId: string
    selectedCategoryId: string
    priceRange: [number, number]
    sortBy: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const updateQueryParams = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            router.push(`${pathname}?${params.toString()}`)
        },
        [pathname, router, searchParams],
    )

    return (
        <div>
            <aside className="flex flex-col gap-6 px-4 md:px-0">
                <div>
                    <Label htmlFor="super-category">Categoria</Label>
                    <Select
                        value={props.selectedSuperCategoryId}
                        onValueChange={(value) => updateQueryParams("superCategoryId", value)}
                    >
                        <SelectTrigger id="super-category">
                            <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {props.superCategories.map((superCategory) => (
                                <SelectItem
                                    key={superCategory.id}
                                    value={superCategory.id}
                                >
                                    {superCategory.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="category">Subcategoria</Label>
                    <Select
                        value={props.selectedCategoryId}
                        onValueChange={(value) => updateQueryParams("categoryId", value)}
                    >
                        <SelectTrigger id="category">
                            <SelectValue
                                className="text-center"
                                placeholder="Selecione a subcategoria"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {props.categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Preço</Label>
                    <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={props.priceRange}
                        className="mt-2"
                        onValueChange={(value) => {
                            updateQueryParams("priceRangeFrom", (value[0] ?? 0).toString())
                            updateQueryParams("priceRangeTo", (value[1] ?? 20).toString())
                        }}
                    />
                    <div className="flex justify-between mt-2">
                        <span>${props.priceRange[0]}</span>
                        <span>${props.priceRange[1]}</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="sort">Ordenar por</Label>
                    <Select
                        value={props.sortBy}
                        onValueChange={(value) => updateQueryParams("sortBy", value)}
                    >
                        <SelectTrigger id="sort">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">Título</SelectItem>
                            <SelectItem value="author">Autor</SelectItem>
                            <SelectItem value="price-asc">Preço: Menor para maior</SelectItem>
                            <SelectItem value="price-desc">Preço: Maior para menor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </aside>
        </div>
    )
}

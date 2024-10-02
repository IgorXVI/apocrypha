"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "~/components/ui/input"

import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

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
                    <Label
                        className="font-bold"
                        htmlFor="sort"
                    >
                        Ordenar por
                    </Label>
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
                <div>
                    <Label
                        className="font-bold"
                        htmlFor="super-category"
                    >
                        Categoria
                    </Label>
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
                    <Label
                        className="font-bold"
                        htmlFor="category"
                    >
                        Subcategoria
                    </Label>
                    <Select
                        value={props.selectedCategoryId}
                        onValueChange={(value) => updateQueryParams("categoryId", value)}
                    >
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecione a subcategoria" />
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
                <div className="flex flex-col gap-3 bg-neutral-200 p-2 px-4 rounded-md">
                    <Label className="font-bold">Preço</Label>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Label htmlFor="price-range-from">De</Label>
                        <Input
                            className="w-1/2"
                            type="number"
                            id="price-range-from"
                            placeholder="Mínimo"
                            value={props.priceRange[0]}
                            onChange={(e) => updateQueryParams("priceRangeFrom", e.target.value)}
                        />
                        <Label htmlFor="price-range-to">Até</Label>
                        <Input
                            className="w-1/2"
                            type="number"
                            id="price-range-to"
                            placeholder="Máximo"
                            value={props.priceRange[1]}
                            onChange={(e) => updateQueryParams("priceRangeTo", e.target.value)}
                        />
                    </div>
                </div>
            </aside>
        </div>
    )
}

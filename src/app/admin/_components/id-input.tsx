"use client"

import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Input } from "~/components/ui/input"
import { type CommonSuggestion } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useDebouncedCallback } from "use-debounce"
import { dbQueryWithToast, toastError } from "~/components/toast/toasting"

export default function IdInput(props: { slug: string; onChange: (value?: string) => void; value?: string; disabled?: boolean; label: string }) {
    const [suggestions, setSuggestions] = useState<CommonSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const searchSuggestions = async (searchTerm: string) => {
            setIsLoading(true)

            const paramsForRequest = new URLSearchParams({
                id: props.value ?? "",
                searchTerm: searchTerm,
            })

            const result = await dbQueryWithToast({
                dbQuery: () =>
                    fetch(`/api/admin/suggestions/${props.slug}?${paramsForRequest.toString()}`, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((res) => res.json())
                        .then((json) => {
                            if (json.success) {
                                return {
                                    data: json.data,
                                    success: true,
                                    errorMessage: "",
                                }
                            }

                            throw new Error(json.errorMessage)
                        })
                        .catch((error) => {
                            return {
                                data: undefined,
                                success: false,
                                errorMessage: error.message,
                            }
                        }),
                mutationName: `${props.slug}-suggestions`,
                waitingMessage: `Buscando ${props.label}...`,
                successMessage: `Dados de ${props.label} encontrados!`,
            })

            setIsLoading(false)

            setSuggestions(result)
        }

        searchSuggestions(searchTerm).catch((error) => {
            toastError((error as Error).message)
        })
    }, [props.label, props.slug, props.value, searchTerm])

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="ml-2 justify-between"
                    disabled={props.disabled ?? isLoading}
                >
                    {props.value && props.value !== ""
                        ? (suggestions.find((s) => s.id === props.value)?.name ?? "N/A")
                        : `Selecione ${props.label}...`}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-col gap-3">
                    <Input
                        type="text"
                        placeholder={`Pesquise ${props.label}...`}
                        className="h-9"
                        onChange={useDebouncedCallback((e) => setSearchTerm(e.target.value), 500)}
                    />

                    {isLoading && <Loader2Icon className="animate-spin" />}
                    {!isLoading &&
                        suggestions.map((s) => (
                            <Button
                                type="button"
                                variant="ghost"
                                key={s.id}
                                onClick={() => {
                                    if (s.id === props.value) {
                                        props.onChange(undefined)
                                    } else {
                                        props.onChange(s.id)
                                    }
                                    setOpen(false)
                                }}
                            >
                                {s.name} <CheckIcon className={cn("ml-auto h-4 w-4", props.value === s.id ? "opacity-100" : "opacity-0")} />
                            </Button>
                        ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

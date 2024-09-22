"use client"

import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Input } from "~/components/ui/input"
import { type CommonDBReturn, type CommonSuggestion } from "~/server/types"
import { cn } from "~/lib/utils"
import { useDebouncedCallback } from "use-debounce"

export default function IdInput(props: {
    onChange: (value: string) => void
    value?: string
    disabled?: boolean
    getSuggestions: (searchTerm: string, id?: string) => Promise<CommonDBReturn<CommonSuggestion[]>>
    label: string
}) {
    const [suggestions, setSuggestions] = useState<CommonSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const { getSuggestions, value } = props

    useEffect(() => {
        const searchSuggestions = async (searchTerm: string) => {
            setIsLoading(true)
            const suggestions = await getSuggestions(searchTerm, value)
            setIsLoading(false)

            if (suggestions.data) {
                setSuggestions(suggestions.data)
            }
        }

        searchSuggestions(searchTerm).catch((error) => console.log(error))
    }, [getSuggestions, searchTerm, value])

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
                    {props.value && props.value !== "" ? suggestions.find((s) => s.id === props.value)?.name : `Selecione ${props.label}...`}
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
                                    props.onChange(s.id)
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

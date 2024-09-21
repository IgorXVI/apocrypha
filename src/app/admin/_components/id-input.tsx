"use client"

import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { type CommonDBReturn, type CommonSuggestion } from "~/server/types"
import { cn } from "~/lib/utils"
import { useDebouncedCallback } from "use-debounce"

export default function IdInput(props: {
    onChange: (value: string) => void
    value?: string
    disabled?: boolean
    getSuggestions: (searchTerm: string) => Promise<CommonDBReturn<CommonSuggestion[]>>
    label: string
}) {
    const [suggestions, setSuggestions] = useState<CommonSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const searchSuggestions = useCallback(
        async (searchTerm: string) => {
            setIsLoading(true)
            const suggestions = await props.getSuggestions(searchTerm)
            setIsLoading(false)

            if (suggestions.data) {
                setSuggestions(suggestions.data)
            }
        },
        [props],
    )

    useEffect(() => {
        searchSuggestions("").catch((error) => console.log(error))
    }, [searchSuggestions])

    const handleSuggestionsSearch = useDebouncedCallback(searchSuggestions, 500)

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="ml-2 justify-between"
                >
                    {props.value && props.value !== "" ? suggestions.find((s) => s.id === props.value)?.name : `Selecione ${props.label}...`}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandInput
                        placeholder={`Pesquise ${props.label}...`}
                        className="h-9"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => handleSuggestionsSearch(e.target.value)}
                    />

                    <CommandList>
                        <CommandEmpty>{`Nenhum dado de ${props.label} encontrado`}</CommandEmpty>
                        <CommandGroup>
                            {isLoading && (
                                <CommandItem>
                                    <Loader2Icon className="animate-spin" />
                                </CommandItem>
                            )}
                            {!isLoading &&
                                suggestions.map((s) => (
                                    <CommandItem
                                        key={s.id}
                                        value={s.id}
                                        onSelect={(currentValue) => {
                                            props.onChange(currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        {s.name}
                                        <CheckIcon className={cn("ml-auto h-4 w-4", props.value === s.id ? "opacity-100" : "opacity-0")} />
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

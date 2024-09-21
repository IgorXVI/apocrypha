"use client"

import { CheckIcon, AArrowDown, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { dbQueryWithToast } from "~/lib/toasting"
import { type CommonDBReturn, type CommonSuggestion } from "~/server/types"
import { cn } from "~/lib/utils"
import { useDebouncedCallback } from "use-debounce"

export default function MultipleIdInput(props: {
    onChange: (value: string[]) => void
    value: string[]
    disabled?: boolean
    getSuggestions: (searchTerm: string) => Promise<CommonDBReturn<CommonSuggestion[]>>
    label: string
}) {
    const [suggestions, setSuggestions] = useState<CommonSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)

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
                    className="w-[200px] justify-between"
                >
                    {props.value ? suggestions.find((s) => s.id === props.value)?.name : `Selecione ${props.label}...`}
                    <AArrowDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder={`Pesquise ${props.label}...`}
                        className="h-9"
                        onInput={useDebouncedCallback(async (e) => {
                            const suggestions = await dbQueryWithToast({
                                dbQuery: () => props.getSuggestions(e.target.value),
                                mutationName: "get-suggestions",
                                waitingMessage: "Buscando sugestões...",
                                successMessage: "Sugestões encontradas",
                            })

                            setIsLoading(false)

                            if (suggestions) {
                                setSuggestions(suggestions)
                            }
                        }, 300)}
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

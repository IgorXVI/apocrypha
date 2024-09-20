"use client"

import * as R from "remeda"
import { SplineIcon } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { dbQueryWithToast } from "~/lib/toasting"
import { type CommonDBReturn, type CommonSuggestion } from "~/server/types"

export default function IdInput(props: {
    onChange: (value: string) => void
    value: string
    disabled?: boolean
    getSuggestions: () => Promise<CommonDBReturn<CommonSuggestion[]>>
    label: string
}) {
    const [suggestions, setSuggestions] = useState<CommonSuggestion[]>([])
    return (
        <Select
            value={props.value}
            onValueChange={props.onChange}
            disabled={props.disabled}
            onOpenChange={async (open) => {
                if (open) {
                    const results = await dbQueryWithToast({
                        dbQuery: props.getSuggestions,
                        mutationName: "getCategorySuggestions",
                        waitingMessage: `Obtendo sugestões de ${props.label}...`,
                        successMessage: `Sugestões de ${props.label} obtidas com sucesso`,
                    })
                    if (results) {
                        setSuggestions(results)
                    }
                }
            }}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={R.capitalize(props.label)} />
            </SelectTrigger>
            <SelectContent>
                {suggestions.length === 0 && <SplineIcon className="animate-spin"></SplineIcon>}
                {suggestions.length > 0 &&
                    suggestions.map((s) => (
                        <SelectItem
                            key={s.id}
                            value={s.id}
                        >
                            {s.name}
                        </SelectItem>
                    ))}
            </SelectContent>
        </Select>
    )
}

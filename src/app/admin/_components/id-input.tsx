"use client"

import { toast } from "sonner"
import { toastError, toastLoading } from "~/components/toast/toasting"

import { useCallback, useMemo, useRef } from "react"
import MultipleSelector, { type Option } from "~/components/ui/multiple-select"
import { mainApi } from "~/lib/redux/apis/main-api/main"
import Link from "next/link"
import { PlusCircleIcon } from "lucide-react"

export default function IdInput(props: {
    slug: string
    onChange: (value?: string[] | string) => void
    value?: string[] | string
    disabled?: boolean
    label: string
    maxSelected?: number
}) {
    const searchTerm = useRef("")

    const optionsQuery = mainApi.useGetSuggestionsQuery({
        slug: props.slug,
        searchTerm: searchTerm.current,
        ids: typeof props.value === "string" ? [props.value] : props.value,
    })

    if (optionsQuery.isLoading) {
        toastLoading("Carregando sugestões...", "optionsQuery")
    } else {
        toast.dismiss("optionsQuery")
    }

    if (optionsQuery.error) {
        toastError(optionsQuery.error)
    }

    const suggestions = useMemo(() => (optionsQuery.data ? (optionsQuery.data.success ? optionsQuery.data.data : []) : []), [optionsQuery.data])

    const value = useMemo(() => {
        if (suggestions.length === 0) {
            return undefined
        }

        if (typeof props.value === "string") {
            const option = suggestions.find((o) => o.value === props.value)

            return option ? [option] : []
        }

        return suggestions.filter((o) => props.value?.includes(o.value))
    }, [suggestions, props.value])

    const { onChange } = props

    const handleSelect = useCallback(
        (options: Option[]) => {
            if (props.maxSelected === 1) {
                onChange(options[0]?.value)
            } else {
                onChange(options.map((o) => o.value))
            }
        },
        [onChange, props.maxSelected],
    )

    return (
        <div className="flex flex-row gap-3 items-center">
            <MultipleSelector
                value={value}
                options={suggestions}
                disabled={props.disabled}
                maxSelected={props.maxSelected}
                onSearch={async (value) => {
                    searchTerm.current = value

                    const result = await optionsQuery.refetch()

                    return result.data?.success ? result.data.data : []
                }}
                triggerSearchOnFocus={true}
                onChange={handleSelect}
                onMaxSelected={(maxLimit) => {
                    toastError(`Seleção de ${props.label}: Não é possível selecionar mais de ${maxLimit}.`)
                }}
                placeholder={`Pesquise ${props.label}...`}
                emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">Nenhum resultado encontrado.</p>}
            />
            <Link
                href={`/admin/${props.slug}?is_creating=true`}
                className="p-2 bg-green-500 text-white rounded-lg text-nowrap min-w-[50px] hover:bg-green-400 transition-all duration-300 
                grid place-content-center"
            >
                <PlusCircleIcon></PlusCircleIcon>
            </Link>
        </div>
    )
}

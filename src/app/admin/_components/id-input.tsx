"use client"

import { dbQueryWithToast, toastError } from "~/components/toast/toasting"

import { useCallback, useEffect, useMemo, useState } from "react"
import MultipleSelector, { type Option } from "~/components/ui/multiple-select"

export default function IdInput(props: {
    slug: string
    onChange: (value?: string[] | string) => void
    value?: string[] | string
    disabled?: boolean
    label: string
    maxSelected?: number
}) {
    const [options, setOptions] = useState<Option[]>([])

    useEffect(() => {
        if (props.value && props.value.length > 0) {
            const paramsForRequest = new URLSearchParams({
                ids: typeof props.value === "string" ? props.value : props.value.join(","),
            })

            dbQueryWithToast({
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
                .then((results) => setOptions(results))
                .catch((error) => {
                    toastError((error as Error).message)
                    return []
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value])

    const searchSuggestions = useCallback(
        (searchTerm: string) => {
            const paramsForRequest = new URLSearchParams({
                searchTerm: searchTerm,
            })

            return dbQueryWithToast({
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
            }).catch((error) => {
                toastError((error as Error).message)
                return []
            })
        },
        [props.label, props.slug],
    )

    const value = useMemo(() => {
        if (typeof props.value === "string") {
            const option = options.find((o) => o.value === props.value)

            return option ? [option] : []
        }

        return options.filter((o) => props.value?.includes(o.value))
    }, [options, props.value])

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
        <div className="w-full">
            <MultipleSelector
                value={value}
                options={options}
                disabled={props.disabled}
                maxSelected={props.maxSelected}
                delay={500}
                onSearch={searchSuggestions}
                triggerSearchOnFocus={true}
                onChange={handleSelect}
                onMaxSelected={(maxLimit) => {
                    toastError(`Seleção de ${props.label}: Não é possível selecionar mais de ${maxLimit}.`)
                }}
                placeholder={`Pesquise ${props.label}...`}
                emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">Nenhum resultado encontrado.</p>}
            />
        </div>
    )
}

"use client"

import { type ZodTypeAny, type ZodObject, type ZodRawShape } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    useForm,
    type Path,
    type ControllerRenderProps,
    type FieldValues,
} from "react-hook-form"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React from "react"

import { Button } from "~/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"
import { dbQueryWithToast } from "~/lib/toasting"

export default function CreateOrUpdate<T>(props: {
    name: string
    paramsPrefix: string
    formSchema: ZodObject<ZodRawShape>
    dbMutation: (values: T) => Promise<{
        success: boolean
        errorMessage: string
        data: T | undefined
    }>
    defaultValues: T
    dbGetOne?: () => Promise<{
        success: boolean
        errorMessage: string
        data: T | undefined
    }>
    inputKeyMap: Record<
        string,
        {
            node: (
                field: ControllerRenderProps<FieldValues, Path<T>>,
            ) => React.ReactNode
            label: string
            description: string | React.ReactNode
        }
    >
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const fieldNames = Object.keys(props.inputKeyMap)

    const form = useForm<ZodRawShape>({
        resolver: zodResolver(props.formSchema),
        defaultValues: async () => {
            const obj: ZodRawShape = {}
            let hasAtLeastOne = false
            fieldNames.forEach((key) => {
                const keyForParams = `${props.paramsPrefix}_${key}`
                const paramValue = searchParams.get(keyForParams)
                if (paramValue) {
                    hasAtLeastOne = true
                    obj[key] = paramValue as unknown as ZodTypeAny
                }
            })

            if (hasAtLeastOne) {
                return obj
            }

            if (!props.dbGetOne) {
                return props.defaultValues as ZodRawShape
            }

            const dbResult = await props.dbGetOne()
            if (dbResult && dbResult.success && dbResult.data) {
                return dbResult.data as ZodRawShape
            }
            return props.defaultValues as ZodRawShape
        },
    })

    const onSubmit = async (values: ZodRawShape) => {
        const params = new URLSearchParams(searchParams)
        fieldNames.forEach((key) => {
            const value = String(values[key])

            const keyForParams = `${props.paramsPrefix}_${key}`

            if (value) {
                params.set(keyForParams, value)
            } else {
                params.delete(keyForParams)
            }
        })

        router.replace(`${pathname}?${params.toString()}`)

        await dbQueryWithToast({
            dbQuery: () => props.dbMutation(values as T),
            mutationName: "creating",
            waitingMessage: `Salvando ${props.name}...`,
            successMessage: "Salvo",
        })
    }

    return (
        <Form {...form}>
            <h1 className="text-center p-5 text-2xl font-extrabold">
                {`Criar ${props.name}`}
            </h1>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-5 flex flex-col gap-3"
            >
                {fieldNames.map((key, index) => (
                    <FormField
                        key={index}
                        disabled={
                            form.formState.isSubmitting ||
                            form.formState.isLoading
                        }
                        control={form.control}
                        name={key as Path<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {props.inputKeyMap[key]?.label}
                                </FormLabel>
                                <FormControl>
                                    {props.inputKeyMap[key]?.node(field)}
                                </FormControl>
                                <FormDescription>
                                    {props.inputKeyMap[key]?.description}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
                <div className="flex flex-row items-center justify-center p-5">
                    <Button
                        disabled={
                            form.formState.isSubmitting ||
                            form.formState.isLoading
                        }
                        type="submit"
                        className="text-xl p-5"
                        variant="destructive"
                    >
                        Salvar
                    </Button>
                </div>
            </form>
        </Form>
    )
}

"use client"

import { type ZodObject, type ZodRawShape, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type ControllerRenderProps, type FieldValues } from "react-hook-form"
import React from "react"

import { Button } from "~/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { dbQueryWithToast } from "./toasting"
import { type CommonDBReturn } from "~/server/types"

function getDefaults<Schema extends ZodObject<ZodRawShape>>(schema: Schema) {
    return Object.fromEntries(
        Object.entries(schema.shape).map(([key, value]) => {
            if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
            return [key, undefined]
        }),
    )
}

type inputKeysWithoutId<I> = Omit<keyof I, "id"> extends string ? Omit<keyof I, "id"> : never

type inputField<I> = ControllerRenderProps<FieldValues, inputKeysWithoutId<I>>

export default function CreateOrUpdate<I>(props: {
    paramsPrefix: string
    formSchema: ZodObject<ZodRawShape>
    dbMutation: (values: I) => Promise<CommonDBReturn<undefined>>
    dbGetOne?: () => Promise<CommonDBReturn<I>>
    inputKeyMap: Record<
        string,
        {
            node: (field: inputField<I>) => React.ReactNode
            label: string
            description: string | React.ReactNode
            className?: string
        }
    >
    waitingMessage: string
    successMessage: string
}) {
    const fieldNames = Object.keys(props.inputKeyMap)

    const form = useForm<ZodRawShape>({
        resolver: zodResolver(props.formSchema),
        defaultValues: async () => {
            if (!props.dbGetOne) {
                return getDefaults(props.formSchema)
            }

            const dbResult = await dbQueryWithToast({
                dbQuery: props.dbGetOne,
                mutationName: "getting",
                waitingMessage: "Buscando dados...",
                successMessage: "Busca realizada com sucesso",
            })
            if (dbResult) {
                return dbResult as ZodRawShape
            }
            return getDefaults(props.formSchema)
        },
    })

    const onSubmit = async (values: ZodRawShape) => {
        await dbQueryWithToast({
            dbQuery: () => props.dbMutation(values as I),
            mutationName: "saving",
            waitingMessage: props.waitingMessage,
            successMessage: props.successMessage,
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-6"
            >
                {fieldNames.map((key, index) => (
                    <FormField
                        key={index}
                        disabled={form.formState.isSubmitting || form.formState.isLoading}
                        control={form.control}
                        name={key}
                        render={({ field }) => (
                            <FormItem className={props.inputKeyMap[key]?.className ?? "flex flex-col justify-center"}>
                                <FormLabel>{props.inputKeyMap[key]?.label}</FormLabel>
                                <FormControl>{props.inputKeyMap[key]?.node(field as unknown as inputField<I>)}</FormControl>
                                <FormDescription>{props.inputKeyMap[key]?.description}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
                <div className="flex flex-row items-center justify-center p-2 md:col-span-2">
                    <Button
                        disabled={form.formState.isSubmitting || form.formState.isLoading}
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

"use client"

import { type ZodObject, type ZodRawShape, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type ControllerRenderProps, type FieldValues } from "react-hook-form"
import React, { useMemo } from "react"

import { Button } from "~/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { dbQueryWithToast, toastError } from "~/components/toast/toasting"
import { mainApi } from "~/lib/redux/apis/main-api/main"

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
    slug: string
    id?: string
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
    refetchParentQuery?: () => Promise<unknown>
}) {
    const fieldNames = useMemo(() => Object.keys(props.inputKeyMap), [props.inputKeyMap])
    const [triggerGetOne] = mainApi.useLazyGetOneQuery()
    const [triggerUpdateOne] = mainApi.useUpdateOneMutation()
    const [triggerCreateOne] = mainApi.useCreateOneMutation()

    const form = useForm<ZodRawShape>({
        resolver: zodResolver(props.formSchema),
        defaultValues: async () =>
            props.id
                ? await triggerGetOne({ slug: props.slug, id: props.id })
                      .then((result) => {
                          if (result.error) {
                              throw new Error(JSON.stringify(result.error))
                          }

                          if (!result.data?.success) {
                              throw new Error(result.data?.errorMessage ?? "Erro desconhecido")
                          }

                          return result.data.data as ZodRawShape
                      })
                      .catch((error) => {
                          toastError(error)
                          return getDefaults(props.formSchema)
                      })
                : getDefaults(props.formSchema),
    })

    const onSubmit = async (values: ZodRawShape) => {
        const method = props.id ? triggerUpdateOne : triggerCreateOne

        await dbQueryWithToast({
            dbQuery: () =>
                method({
                    slug: props.slug,
                    id: props.id ?? "",
                    data: values,
                })
                    .then((result) => {
                        if (result.error) {
                            throw new Error(JSON.stringify(result.error))
                        }

                        if (!result.data.success) {
                            throw new Error(result.data.errorMessage)
                        }

                        return {
                            data: undefined,
                            success: result.data.success,
                            errorMessage: "",
                        }
                    })
                    .then((prevResult) => {
                        if (props.refetchParentQuery) {
                            return props.refetchParentQuery().then(() => prevResult)
                        }

                        return prevResult
                    })
                    .catch((error) => ({
                        data: undefined,
                        success: false,
                        errorMessage: (error as Error).message,
                    })),
            mutationName: "saving",
            waitingMessage: props.waitingMessage,
            successMessage: props.successMessage,
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={`flex flex-col gap-3 md:grid ${fieldNames.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"} md:gap-6`}
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

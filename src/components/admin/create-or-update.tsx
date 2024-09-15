"use client"

import { type ZodObject, type ZodRawShape } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    useForm,
    type Path,
    type ControllerRenderProps,
    type FieldValues,
} from "react-hook-form"
import { useRouter } from "next/navigation"
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

export default function CreateOrUpdate<T, K, Z>(props: {
    formSchema: ZodObject<ZodRawShape>
    dbMutation: (values: T) => Promise<{
        success: boolean
        errorMessage: string
        data: K | undefined
    }>
    defaultValues: T
    dbGetOne?: () => Promise<{
        success: boolean
        errorMessage: string
        data: Z | undefined
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
    title: string
    mutationName: string
    waitingMessage: string
    successMessage: string
}) {
    const router = useRouter()

    const form = useForm<ZodRawShape>({
        resolver: zodResolver(props.formSchema),
        defaultValues: async () => {
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
        await dbQueryWithToast({
            dbQuery: () => props.dbMutation(values as T),
            mutationName: props.mutationName,
            waitingMessage: props.waitingMessage,
            successMessage: props.successMessage,
        })

        router.back()
    }

    return (
        <Form {...form}>
            <h1 className="text-center p-5 text-2xl font-extrabold">
                {props.title}
            </h1>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-5 flex flex-col gap-3"
            >
                {Object.keys(props.inputKeyMap).map((key, index) => (
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
                <div className="flex flex-row items-center justify-center gap-10 mt-10 p-5">
                    <Button
                        disabled={
                            form.formState.isSubmitting ||
                            form.formState.isLoading
                        }
                        type="submit"
                        className="text-xl p-5 mr-auto"
                        variant="destructive"
                    >
                        Salvar
                    </Button>
                    <Button
                        disabled={
                            form.formState.isSubmitting ||
                            form.formState.isLoading
                        }
                        type="button"
                        className="text-xl p-5"
                        onClick={() => router.back()}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </Form>
    )
}
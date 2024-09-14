"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

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
import { Input } from "~/components/ui/input"
import { getOneCurrency, updateCurrency } from "~/server/queries"
import { dbQueryWithToast } from "~/lib/toasting"

const formSchema = z.object({
    label: z
        .string()
        .min(1, {
            message: "Prefixo deve ter ao menos 1 caracter.",
        })
        .max(5, {
            message: "Prefixo deve ter no máximo 5 caracteres.",
        }),
    iso4217Code: z
        .string()
        .min(3, {
            message: "Código ISO 4217 deve ter ao menos 3 caracteres.",
        })
        .max(4, {
            message: "Código ISO 4217 deve ter no máximo 4 caracteres.",
        }),
})

export default function CreateCurrency({
    params: { id },
}: {
    params: { id: string }
}) {
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: async () => {
            const dbResult = await getOneCurrency(id)
            if (dbResult.success && dbResult.data) {
                return {
                    label: dbResult.data.label,
                    iso4217Code: dbResult.data.iso4217Code,
                }
            }
            return {
                label: "",
                iso4217Code: "",
            }
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await dbQueryWithToast({
            dbMutation: () => updateCurrency(id, values),
            mutationName: "currency-update",
            waitingMessage: "Atualizando...",
            successMessage: "Moeda atualizada",
        })

        router.back()
    }

    return (
        <Form {...form}>
            <h1 className="text-center p-5 text-2xl font-extrabold">
                Atualizar Moeda
            </h1>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-5 flex flex-col gap-3"
            >
                <FormField
                    disabled={
                        form.formState.isSubmitting || form.formState.isLoading
                    }
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prefixo</FormLabel>
                            <FormControl>
                                <Input placeholder="$" {...field} />
                            </FormControl>
                            <FormDescription>
                                Esse é o préfixo que vai aparecer antes do valor
                                monetário.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    disabled={
                        form.formState.isSubmitting || form.formState.isLoading
                    }
                    control={form.control}
                    name="iso4217Code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código ISO 4217</FormLabel>
                            <FormControl>
                                <Input placeholder="EUR" {...field} />
                            </FormControl>
                            <FormDescription>
                                Esse é o código
                                <a
                                    href="https://pt.wikipedia.org/wiki/ISO_4217"
                                    className="underline mr-1 ml-1"
                                >
                                    ISO 4217
                                </a>
                                da moeda.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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

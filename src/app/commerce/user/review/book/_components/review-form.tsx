"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Star } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"

import { Button } from "~/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { reviewValidationSchema, type ReviewSchemaType } from "~/lib/validation"
import { upsertReview } from "~/server/actions/review"

export default function ReviewForm({ bookId, existingValues }: { bookId: string; existingValues?: ReviewSchemaType }) {
    const defaultValues = existingValues
        ? existingValues
        : {
              rating: 0,
              bookId,
          }

    const form = useForm<ReviewSchemaType>({
        resolver: zodResolver(reviewValidationSchema),
        defaultValues,
    })

    const [rating, setRating] = useState(defaultValues.rating)

    const onSubmit = async (values: ReviewSchemaType) => {
        toastLoading("Enviando...", "review-create")
        upsertReview(values)
            .then((result) => {
                toast.dismiss("review-create")

                if (!result.success) {
                    if (result.issues) {
                        toastError(result.issues.map((issue) => issue.message).join(", "))
                        return
                    }
                    toastError(result.errorMessage)
                    return
                }

                toastSuccess("Avaliação enviada")
            })
            .catch((error) => {
                toast.dismiss("review-create")
                toastError(error)
            })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-3"
            >
                <FormField
                    disabled={form.formState.isSubmitting || form.formState.isLoading}
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Qualidade</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(valueStr) => {
                                        const value = Number(valueStr)

                                        setRating(value)

                                        field.onChange(value)
                                    }}
                                    defaultValue={field.value.toString()}
                                    className="flex space-x-2"
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <Label
                                            key={value}
                                            className="flex items-center gap-2 px-2 py-1 border rounded-md cursor-pointer hover:text-yellow-500"
                                        >
                                            <Star
                                                fill={rating === value ? "yellow" : "white"}
                                                className="h-4 w-4"
                                            />
                                            <span>{value}</span>
                                            <RadioGroupItem
                                                className="sr-only"
                                                key={value}
                                                value={value.toString()}
                                            ></RadioGroupItem>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormDescription>De 1 a 5, qual é a qualidade do livro?</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    disabled={form.formState.isSubmitting || form.formState.isLoading}
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    name="title"
                                    id="title"
                                    placeholder="Muito bom..."
                                    required
                                />
                            </FormControl>
                            <FormDescription>Resuma sua avaliação</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    disabled={form.formState.isSubmitting || form.formState.isLoading}
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avaliação</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    name="body"
                                    id="review"
                                    placeholder="O livro foi muito bom, adoro o autor..."
                                    required
                                    rows={10}
                                />
                            </FormControl>
                            <FormDescription>Descreva o que você achou do livro</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="place-self-center"
                >
                    Enviar avaliação
                </Button>
            </form>
        </Form>
    )
}

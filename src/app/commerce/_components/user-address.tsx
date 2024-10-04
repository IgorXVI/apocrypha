"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon, MapPin, XCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { dbQueryWithToast, toastError } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { brasilApi } from "~/lib/redux/apis/brasil-api/brasil"
import { useDebouncedCallback } from "use-debounce"
import { useMemo, useState } from "react"
import { mainApi } from "~/lib/redux/apis/main-api/main"
import { useUser } from "@clerk/nextjs"

export const userAddressValidationSchema = z.object({
    cep: z.preprocess(
        (value) => (typeof value === "string" ? value.replace("-", "") : value),
        z
            .string()
            .min(8, {
                message: "CEP deve ter no mínimo 8 dígitos.",
            })
            .max(8, {
                message: "CEP deve ter no máximo 8 dígitos.",
            })
            .transform((cepStr) => Number(cepStr))
            .pipe(
                z
                    .number({
                        message: "CEP deve ser um número válido",
                    })
                    .transform((cepNum) => cepNum.toString()),
            )
            .default(""),
    ),
    number: z.preprocess(
        (value) => (typeof value === "string" ? Number(value) : value),
        z.number().int().positive({ message: "Número deve ser positivo." }).default(0),
    ),
    complement: z
        .string()
        .min(2, {
            message: "Complemento deve ter no mínimo 2 letras.",
        })
        .optional(),
})

export type UserAddressSchemaType = z.infer<typeof userAddressValidationSchema>

export default function UserAddress() {
    const user = useUser()

    const [isDisabled, setIsDisabled] = useState(false)
    const [cepDetails, setCepDetails] = useState({
        state: "",
        city: "",
        neighborhood: "",
        street: "",
    })

    const [triggerGetCepInfo] = brasilApi.useLazyGetCepInfoQuery()

    const [triggerSaveUserAddress] = mainApi.useSaveUserAddressMutation()
    const getUserAddress = mainApi.useGetUserAddressQuery(undefined)

    const addressData = getUserAddress.data?.success ? getUserAddress.data.data : undefined

    const form = useForm<UserAddressSchemaType>({
        resolver: zodResolver(userAddressValidationSchema),
    })

    const onSubmit = async (values: UserAddressSchemaType) => {
        await dbQueryWithToast({
            dbQuery: () =>
                triggerSaveUserAddress({
                    data: {
                        ...values,
                        ...cepDetails,
                    },
                })
                    .then((result) => {
                        if (result.error) {
                            if ("status" in result.error) {
                                const erroData = result.error.data as { message: string } | undefined

                                throw new Error(
                                    erroData?.message ?? `STATUS - ${result.error.status}: DATA - ${JSON.stringify(result.error.data ?? {})}`,
                                )
                            } else {
                                throw new Error(`${result.error.name}: ${result.error.message}`)
                            }
                        }

                        return {
                            data: result.data,
                            success: true,
                            errorMessage: "",
                        }
                    })
                    .catch((error) => ({
                        data: undefined,
                        success: false,
                        errorMessage: (error as Error).message,
                    })),
            mutationName: "save-user-address",
            waitingMessage: "Salvando endereço...",
            successMessage: "Endereço salvo.",
        })
    }

    const onCepInput = useDebouncedCallback(async (e) => {
        setIsDisabled(true)

        const cepResponse = await dbQueryWithToast({
            dbQuery: () =>
                triggerGetCepInfo(e.target.value || "0")
                    .then((result) => {
                        if (result.error) {
                            if ("status" in result.error) {
                                if (result.error.status === 404) {
                                    throw new Error("CEP não foi encontrado.")
                                }

                                const erroData = result.error.data as { message: string } | undefined

                                throw new Error(
                                    erroData?.message ?? `STATUS - ${result.error.status}: DATA - ${JSON.stringify(result.error.data ?? {})}`,
                                )
                            } else {
                                throw new Error(`${result.error.name}: ${result.error.message}`)
                            }
                        }

                        return {
                            data: result.data,
                            success: true,
                            errorMessage: "",
                        }
                    })
                    .catch((error) => ({
                        data: undefined,
                        success: false,
                        errorMessage: (error as Error).message,
                    })),
            mutationName: "get-cep-info",
            waitingMessage: "Buscando dados do CEP...",
            successMessage: "Dados do CEP encontrados.",
        })

        setIsDisabled(false)

        if (!cepResponse) {
            return
        }

        setCepDetails(cepResponse)
    }, 500)

    const userName = useMemo(() => user.user?.firstName ?? "N/A", [user])

    if (getUserAddress.isLoading) {
        return <LoaderCircleIcon className="animate-spin"></LoaderCircleIcon>
    }

    if (getUserAddress.isError) {
        toastError(getUserAddress.error as string)
        return <XCircleIcon color="red"></XCircleIcon>
    }

    return (
        <Dialog
            onOpenChange={(open) => {
                if (open && addressData) {
                    form.setValue("cep", addressData.cep)
                    form.setValue("number", addressData.number)
                    form.setValue("complement", addressData.complement ?? undefined)
                    setCepDetails(addressData)
                }
            }}
        >
            <DialogTrigger>
                <div className="flex items-center gap-1">
                    <MapPin className="h-7 w-7"></MapPin>
                    {!addressData && <span className="font-bold text-sm ml-2">Olá Selecione o endereço</span>}
                    {addressData && (
                        <div className="ml-2 flex gap-1 md:flex-col">
                            <span className="text-sm">Enviar para {userName}</span>
                            <span className="font-bold text-sm">
                                {addressData.city} {addressData.cep}
                            </span>
                        </div>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="common-form-modal">
                <DialogHeader>
                    <DialogTitle className="mb-5">Informe os dados do endereço.</DialogTitle>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            <FormField
                                disabled={isDisabled}
                                control={form.control}
                                name="cep"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CEP</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="CEP"
                                                onInput={onCepInput}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Informe o CEP do seu endereço.
                                            {cepDetails.state !== "" && (
                                                <>
                                                    <br />
                                                    <br />
                                                    <span>Estado: {cepDetails.state}</span>
                                                    <br />
                                                    <span>Cidade: {cepDetails.city}</span>
                                                    <br />
                                                    <span>Bairro: {cepDetails.neighborhood}</span>
                                                    <br />
                                                    <span>Logradouro: {cepDetails.street}</span>
                                                    <br />
                                                </>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isDisabled}
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Número"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Informe o número da sua residência.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isDisabled}
                                control={form.control}
                                name="complement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Complemento (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>Informe o complemento do seu endereço, caso necessário.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={isDisabled}
                                type="submit"
                                className="col-span-full place-self-center"
                            >
                                Salvar
                            </Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon, MapPin, XCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { brasilApi } from "~/lib/redux/apis/brasil-api/brasil"
import { useState, useMemo } from "react"
import { mainApi } from "~/lib/redux/apis/main-api/main"
import { useUser } from "@clerk/nextjs"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { type UserAddressSchemaType, userAddressValidationSchema } from "~/lib/validation"

export default function UserAddress() {
    const user = useUser()

    const [isDisabled, setIsDisabled] = useState(false)
    const [modalClose, setmodalClose] = useState(true)
    const [cepDetails, setCepDetails] = useState<
        | {
              state: string
              city: string
              neighborhood: string
              street: string
          }
        | undefined
    >()

    const [triggerGetCepInfo] = brasilApi.useLazyGetCepInfoQuery()

    const [triggerSaveUserAddress] = mainApi.useSaveUserAddressMutation()
    const getUserAddress = mainApi.useGetUserAddressQuery(undefined)

    const addressData = getUserAddress.data?.success ? (getUserAddress.data.data ?? undefined) : undefined

    const form = useForm<UserAddressSchemaType>({
        resolver: zodResolver(userAddressValidationSchema),
    })

    const onSubmit = (values: UserAddressSchemaType) => {
        if (!cepDetails) {
            toastError("Por favor, digite um CEP válido.")
            return
        }

        setIsDisabled(true)
        toastLoading("Salvando dados do endereço...", "save-address")

        triggerSaveUserAddress({
            data: values,
        })
            .then((result) => {
                if (result.error) {
                    toast.dismiss("save-address")
                    setIsDisabled(false)
                    toastError(result.error)
                } else {
                    return getUserAddress.refetch().then(() => {
                        toast.dismiss("save-address")
                        setIsDisabled(false)
                        toastSuccess("Salvo")
                    })
                }
            })
            .catch((error) => {
                toast.dismiss("save-address")
                setIsDisabled(false)
                toastError(error)
            })
    }

    const onCepInput = useDebouncedCallback((e) => {
        toastLoading("Buscando dados do CEP...", "CEP-search")

        triggerGetCepInfo((e.target as HTMLInputElement).value || "0")
            .then((result) => {
                toast.dismiss("CEP-search")
                if (result.error || !result.data) {
                    toastError("Dados do CEP não foram encontrados.")
                    setCepDetails(undefined)
                } else {
                    setCepDetails(result.data)
                }
            })
            .catch((error) => {
                toast.dismiss("CEP-search")
                toastError(error)
            })
    }, 700)

    const userName = useMemo(() => user.user?.firstName ?? "N/A", [user])

    if (getUserAddress.isLoading) {
        return <LoaderCircleIcon className="animate-spin"></LoaderCircleIcon>
    }

    if (getUserAddress.isError) {
        toastError(getUserAddress.error)
        return <XCircleIcon color="red"></XCircleIcon>
    }

    return (
        <Dialog
            open={!modalClose}
            onOpenChange={(open) => {
                if (open && addressData) {
                    form.setValue("cep", addressData.cep)
                    form.setValue("number", addressData.number)
                    form.setValue("complement", addressData.complement ?? undefined)
                    setCepDetails(addressData)
                }
                setmodalClose(!open)
            }}
        >
            <DialogTrigger>
                <div className="flex items-center gap-1">
                    <MapPin className="h-7 w-7"></MapPin>
                    {!addressData && <span className="font-bold text-sm ml-2">Olá Selecione o endereço</span>}
                    {addressData && (
                        <div className="ml-2 flex gap-1 xl:flex-col">
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
                                            {cepDetails && cepDetails.state !== "" && (
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

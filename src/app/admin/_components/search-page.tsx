"use client"

import { PlusCircle, Search } from "lucide-react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"
import { useDebouncedCallback } from "use-debounce"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"
import { type ZodObject, type ZodRawShape } from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "~/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import DeleteOne from "./delete-one"
import { type PossibleDBOutput } from "~/lib/types"
import CreateOrUpdate from "./create-or-update"
import { toastError } from "~/components/toast/toasting"
import { mainApi } from "~/lib/redux/apis/main-api/main"
import DataTable from "./data-table"
import { calcSkip } from "~/lib/utils"

export default function SearchPage(
    props: Readonly<{
        slug: string
        name: string
        namePlural: string
        tableHeaders: Record<string, string>
        formSchema: ZodObject<ZodRawShape>
        inputKeyMap: Record<
            string,
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                node: (field: ControllerRenderProps<FieldValues, any>) => React.ReactNode
                label: string
                description: string | React.ReactNode
                className?: string
            }
        >
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tableValuesMap?: Record<string, (value: any) => React.ReactNode | string>
    }>,
) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const currentSearchTerm = useMemo(() => searchParams.get("search") ?? "", [searchParams])

    const currentPage = useMemo(() => Number(searchParams.get("page")) || 1, [searchParams])

    const currentTake = useMemo(() => Number(searchParams.get("take")) || 10, [searchParams])

    const getRowsQuery = mainApi.useGetManyQuery({
        slug: props.slug,
        take: currentTake,
        skip: calcSkip(currentPage, currentTake),
        searchTerm: currentSearchTerm,
    })

    const rows = useMemo(
        () => (getRowsQuery.data ? (getRowsQuery.data.success ? (getRowsQuery.data.data.rows as PossibleDBOutput[]) : []) : []),
        [getRowsQuery.data],
    )

    const total = useMemo(() => (getRowsQuery.data ? (getRowsQuery.data.success ? getRowsQuery.data.data.total : 0) : 0), [getRowsQuery.data])

    if (getRowsQuery.isError) {
        toastError(JSON.stringify(getRowsQuery.error))
    }

    if (!getRowsQuery.isLoading && !getRowsQuery.data?.success) {
        toastError(getRowsQuery.data?.errorMessage ?? "Erro desconhecido")
    }

    enum ModalParams {
        delete = "delete_id",
        update = "update_id",
        create = "is_creating",
    }

    const closeModal = useCallback(() => {
        const params = new URLSearchParams(searchParams)
        searchParams.forEach((_, key) => {
            if (key.startsWith("delete_") || key.startsWith("update_") || key.startsWith("create_") || key.startsWith("is_creating")) {
                params.delete(key)
            }
        })
        router.replace(`${pathname}?${params.toString()}`)
    }, [pathname, router, searchParams])

    const setNewModalParams = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams)
            searchParams.forEach((_, key) => {
                if (key.startsWith("delete_") || key.startsWith("update_") || key.startsWith("create_") || key.startsWith("is_creating")) {
                    params.delete(key)
                }
            })

            params.set(key, value)

            router.replace(`${pathname}?${params.toString()}`)
        },
        [pathname, router, searchParams],
    )

    const hasModalParams = useCallback(() => {
        return searchParams.has(ModalParams.delete) || searchParams.has(ModalParams.update) || searchParams.has(ModalParams.create)
    }, [ModalParams, searchParams])

    return (
        <main className="flex flex-col p-2 gap-3">
            <div className="flex flex-row items-center p-2 gap-3">
                <div className="relative flex-1 md:grow-0 mr-auto md:ml-auto md:mr-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Procure..."
                        className="w-full rounded-lg bg-background pl-8 lg:w-[320px]"
                        defaultValue={searchParams.get("search")?.toString()}
                        onChange={useDebouncedCallback((e) => {
                            const params = new URLSearchParams(searchParams)
                            params.set("search", e.target.value)
                            params.set("page", "1")
                            router.replace(`${pathname}?${params.toString()}`)
                        }, 500)}
                    />
                </div>
                <div>
                    <Select
                        defaultValue={searchParams.get("take")?.toString()}
                        onValueChange={(value) => {
                            const params = new URLSearchParams(searchParams)
                            params.set("take", value)
                            params.set("page", "1")
                            router.replace(`${pathname}?${params.toString()}`)
                        }}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue placeholder="Linhas"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    className="h-7 p-5 bg-green-500"
                    onClick={() => setNewModalParams(ModalParams.create, "true")}
                >
                    <PlusCircle />
                </Button>
            </div>

            <DataTable
                {...props}
                tableDescription={`Crie, atualize, apague ou busque ${props.namePlural}.`}
                rows={rows}
                isError={getRowsQuery.isError}
                isSuccess={getRowsQuery.isSuccess}
                isLoading={getRowsQuery.isLoading}
                pagination={{
                    urlPageParamName: "page",
                    total,
                    page: currentPage,
                    take: currentTake,
                }}
                tableRowActions={{
                    label: "Modificar",
                    actions: [
                        {
                            label: "Atualizar",
                            onClick: (rowId) => setNewModalParams(ModalParams.update, rowId),
                        },
                        {
                            label: "Apagar",
                            onClick: (rowId) => setNewModalParams(ModalParams.delete, rowId),
                        },
                    ],
                }}
                onCreate={() => setNewModalParams(ModalParams.create, "true")}
            ></DataTable>

            <Dialog
                open={hasModalParams()}
                onOpenChange={(open) => {
                    if (!open) {
                        closeModal()
                    }
                }}
            >
                <DialogContent className="common-form-modal">
                    {searchParams.has(ModalParams.delete) && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Apagar {props.name}.</DialogTitle>
                                <DialogDescription>
                                    Apagar {props.name} com id
                                    {' "'}
                                    {searchParams.get(ModalParams.delete)}
                                    {'"'}.
                                </DialogDescription>
                            </DialogHeader>
                            <DeleteOne
                                waitingMessage={`Apagando ${props.name}...`}
                                successMessage="Apagado."
                                slug={props.slug}
                                id={searchParams.get(ModalParams.delete) ?? ""}
                                onConfirm={() => closeModal()}
                                refetchParentQuery={() => getRowsQuery.refetch().unwrap()}
                            ></DeleteOne>
                        </>
                    )}
                    {searchParams.has(ModalParams.update) && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Atualizar {props.name}.</DialogTitle>
                                <DialogDescription>
                                    Atualizar valores de {props.name} com id
                                    {' "'}
                                    {searchParams.get(ModalParams.update)}
                                    {'"'}.
                                </DialogDescription>
                            </DialogHeader>
                            <CreateOrUpdate
                                paramsPrefix="update"
                                waitingMessage={`Atualizando ${props.name}...`}
                                successMessage="Atualizado."
                                formSchema={props.formSchema}
                                inputKeyMap={props.inputKeyMap}
                                slug={props.slug}
                                id={searchParams.get(ModalParams.update) ?? ""}
                                refetchParentQuery={() => getRowsQuery.refetch().unwrap()}
                            ></CreateOrUpdate>
                        </>
                    )}
                    {searchParams.has(ModalParams.create) && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Criar {props.name}.</DialogTitle>
                                <DialogDescription>Determine os valores do novo {props.name}.</DialogDescription>
                            </DialogHeader>
                            <CreateOrUpdate
                                paramsPrefix="create"
                                waitingMessage={`Criando ${props.name}...`}
                                successMessage="Criado."
                                formSchema={props.formSchema}
                                inputKeyMap={props.inputKeyMap}
                                slug={props.slug}
                                refetchParentQuery={() => getRowsQuery.refetch().unwrap()}
                            ></CreateOrUpdate>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    )
}

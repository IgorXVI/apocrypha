"use client"

import * as R from "remeda"
import { MoreHorizontal, PlusCircle, Search, LoaderCircle, CircleX, AlertCircle, CheckIcon, XIcon } from "lucide-react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"
import { type ZodObject, type ZodRawShape } from "zod"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import FieldTooLong from "./field-too-long"
import Image from "next/image"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "~/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import DeleteOne from "./delete-one"
import { type PossibleDBOutput } from "~/lib/types"
import CreateOrUpdate from "./create-or-update"
import { toastError } from "~/components/toast/toasting"

type inputKeysWithoutId<I> = Omit<keyof I, "id"> extends string ? Omit<keyof I, "id"> : never

export default function SearchPage<I, D extends PossibleDBOutput, K extends PossibleDBOutput>(
    props: Readonly<{
        slug: string
        name: string
        namePlural: string
        tableHeaders: Record<keyof D, string>
        formSchema: ZodObject<ZodRawShape>
        inputKeyMap: Record<
            string,
            {
                node: (field: ControllerRenderProps<FieldValues, inputKeysWithoutId<I>>) => React.ReactNode
                label: string
                description: string | React.ReactNode
                className?: string
            }
        >
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tableValuesMap?: Record<keyof K, (value: any) => React.ReactNode | string>
    }>,
) {
    const [rows, setRows] = useState<D[]>([])
    const [total, setTotal] = useState(0)
    const [getRowsDone, setGetRowsDone] = useState(false)
    const [showErrorIndicator, setShowErrorIndicator] = useState(false)

    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const toastDBRowsError = useCallback((errorMessage: string) => {
        setShowErrorIndicator(true)
        toastError(errorMessage)
    }, [])

    const currentSearchTerm = useMemo(() => searchParams.get("search") ?? "", [searchParams])

    const currentPage = useMemo(() => Number(searchParams.get("page")) || 1, [searchParams])

    const currentTake = useMemo(() => Number(searchParams.get("take")) || 10, [searchParams])

    const maxPage = useMemo(() => Math.ceil(total / currentTake), [total, currentTake])

    const getChangedPageLink = useCallback(
        (page: number) => {
            const params = new URLSearchParams(searchParams)

            params.set("page", page.toString())

            return `${pathname}?${params.toString()}`
        },
        [searchParams, pathname],
    )

    const getNextPageLink = useCallback(
        (offset: number) => {
            const params = new URLSearchParams(searchParams)

            const newPage = currentPage + offset

            if (newPage <= 0) {
                return pathname
            }

            params.set("page", newPage.toString())

            return `${pathname}?${params.toString()}`
        },
        [searchParams, pathname, currentPage],
    )

    const getRows = useCallback(async () => {
        try {
            setGetRowsDone(false)

            const paramsForRequest = new URLSearchParams({
                take: currentTake.toString(),
                skip: (currentTake * (currentPage - 1)).toString(),
                searchTerm: currentSearchTerm,
            })

            const result = await fetch(`/api/admin/${props.slug}?${paramsForRequest.toString()}`, {
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
                        errorMessage: (error as Error).message,
                    }
                })

            if (!result.success) {
                toastDBRowsError(result.errorMessage)
                return
            }

            setGetRowsDone(true)

            if (result.data) {
                setShowErrorIndicator(false)
                setRows(result.data.rows)
                setTotal(result.data.total)
            }
        } catch (error) {
            toastDBRowsError((error as Error).message)
        }
    }, [props.slug, currentPage, currentSearchTerm, currentTake, toastDBRowsError])

    useEffect(() => {
        getRows().catch((error) => {
            toastDBRowsError((error as Error).message)
        })
    }, [getRows, toastDBRowsError])

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
        getRows().catch((error) => {
            toastDBRowsError((error as Error).message)
        })
    }, [getRows, pathname, router, searchParams, toastDBRowsError])

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

    const headers = useMemo(() => Object.values(props.tableHeaders), [props.tableHeaders])

    const headerKeys = useMemo(() => Object.keys(props.tableHeaders), [props.tableHeaders])

    return (
        <main className="flex flex-col p-2 gap-3">
            <div className="flex flex-row items-center p-2 gap-3">
                <div className="relative flex-1 md:grow-0 mr-auto md:ml-auto md:mr-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Procure..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
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
                        <SelectContent className="bg-gray-50">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    className="h-7 p-5"
                    onClick={() => setNewModalParams(ModalParams.create, "true")}
                >
                    <PlusCircle />
                </Button>
            </div>

            <Card x-chunk="dashboard-06-chunk-0">
                {!getRowsDone && !showErrorIndicator && (
                    <div className="flex w-full justify-center items-center h-[80vh]">
                        <LoaderCircle
                            width={100}
                            height={100}
                            className="animate-spin"
                        ></LoaderCircle>
                    </div>
                )}
                {showErrorIndicator && (
                    <div className="flex w-full justify-center items-center h-[80vh]">
                        <CircleX
                            width={100}
                            height={100}
                            color="red"
                        ></CircleX>
                    </div>
                )}
                {getRowsDone && rows.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-6 text-center h-[80vh]">
                        <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Sem {props.namePlural}</h3>
                        <p className="text-sm text-gray-500 mb-4">Parece que não há dados para {props.namePlural} cadastrados ainda.</p>
                        <Button
                            onClick={() => setNewModalParams(ModalParams.create, "true")}
                            className="flex items-center"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar {props.name}
                        </Button>
                    </div>
                )}
                {getRowsDone && rows.length !== 0 && (
                    <>
                        <CardHeader>
                            <CardTitle>{R.capitalize(props.namePlural)}</CardTitle>
                            <CardDescription>Crie, atualize, apague ou busque {props.namePlural}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-nowrap">
                                        {headers.map((text, index) => (
                                            <TableHead
                                                key={index}
                                                className="text-center"
                                            >
                                                {text}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {headerKeys.map((attr) => (
                                                <TableCell
                                                    key={attr}
                                                    className="table-cell border-r-[1px]"
                                                >
                                                    <div className="flex items-center justify-center w-full">
                                                        {props.tableValuesMap?.[attr] ? (
                                                            props.tableValuesMap[attr](row[attr])
                                                        ) : attr.includes("Url") ? (
                                                            <Image
                                                                alt="Product image"
                                                                className="aspect-square rounded-md object-cover"
                                                                src={row[attr]}
                                                                height="64"
                                                                width="64"
                                                            />
                                                        ) : typeof row[attr] === "boolean" ? (
                                                            row[attr] ? (
                                                                <CheckIcon className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <XIcon className="w-4 h-4 text-red-500" />
                                                            )
                                                        ) : typeof row[attr] === "string" && attr.endsWith("Date") ? (
                                                            new Date(row[attr]).toLocaleDateString()
                                                        ) : !row[attr] ? (
                                                            "N/A"
                                                        ) : row[attr] instanceof Date ? (
                                                            row[attr].toLocaleDateString()
                                                        ) : typeof row[attr] === "string" ? (
                                                            <FieldTooLong
                                                                content={row[attr]}
                                                                numberOfCols={headers.length}
                                                            ></FieldTooLong>
                                                        ) : (
                                                            row[attr]
                                                        )}
                                                    </div>
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            aria-haspopup="true"
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => setNewModalParams(ModalParams.update, row.id as string)}
                                                        >
                                                            Atualizar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => setNewModalParams(ModalParams.delete, row.id as string)}
                                                        >
                                                            Apagar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>

                        <CardFooter className="flex flex-row gap-2 text-sm justify-between">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        {currentPage !== 1 && <PaginationPrevious href={currentPage === 1 ? "#" : getNextPageLink(-1)} />}
                                    </PaginationItem>

                                    {currentPage - 5 > 1 && (
                                        <div className="hidden md:flex">
                                            <PaginationItem>
                                                <PaginationLink href={getChangedPageLink(1)}>1</PaginationLink>
                                            </PaginationItem>

                                            {currentPage - 6 !== 1 && <PaginationEllipsis />}
                                        </div>
                                    )}

                                    <PaginationItem className="hidden md:block">
                                        {currentPage - 5 > 0 && <PaginationLink href={getNextPageLink(-5)}>{currentPage - 5}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {currentPage - 4 > 0 && <PaginationLink href={getNextPageLink(-4)}>{currentPage - 4}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {currentPage - 3 > 0 && <PaginationLink href={getNextPageLink(-3)}>{currentPage - 3}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {currentPage - 2 > 0 && <PaginationLink href={getNextPageLink(-2)}>{currentPage - 2}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {currentPage - 1 > 0 && <PaginationLink href={getNextPageLink(-1)}>{currentPage - 1}</PaginationLink>}
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            isActive
                                        >
                                            {currentPage}
                                        </PaginationLink>
                                    </PaginationItem>

                                    <PaginationItem className="hidden md:block">
                                        {maxPage >= currentPage + 1 && <PaginationLink href={getNextPageLink(1)}>{currentPage + 1}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {maxPage >= currentPage + 2 && <PaginationLink href={getNextPageLink(2)}>{currentPage + 2}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {maxPage >= currentPage + 3 && <PaginationLink href={getNextPageLink(3)}>{currentPage + 3}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {maxPage >= currentPage + 4 && <PaginationLink href={getNextPageLink(4)}>{currentPage + 4}</PaginationLink>}
                                    </PaginationItem>
                                    <PaginationItem className="hidden md:block">
                                        {maxPage >= currentPage + 5 && <PaginationLink href={getNextPageLink(5)}>{currentPage + 5}</PaginationLink>}
                                    </PaginationItem>

                                    {maxPage > currentPage + 5 && (
                                        <div className="hidden md:flex">
                                            {currentPage + 6 !== maxPage && <PaginationEllipsis />}
                                            <PaginationItem>
                                                <PaginationLink href={getChangedPageLink(maxPage)}>{maxPage}</PaginationLink>
                                            </PaginationItem>
                                        </div>
                                    )}

                                    <PaginationItem>
                                        {currentPage !== maxPage && <PaginationNext href={maxPage > currentPage ? getNextPageLink(1) : "#"} />}
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </CardFooter>
                    </>
                )}
            </Card>

            <Dialog
                open={hasModalParams()}
                onOpenChange={(open) => {
                    if (!open) {
                        closeModal()
                    }
                }}
            >
                <DialogContent className="overflow-y-scroll max-h-full scrollbar-none md:max-w-[60vw]">
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
                            ></CreateOrUpdate>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    )
}

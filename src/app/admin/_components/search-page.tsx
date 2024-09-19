"use client"

import {
    MoreHorizontal,
    PlusCircle,
    Search,
    LoaderCircle,
    CircleX,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "~/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import FieldTooLong from "./field-too-long"
import Image from "next/image"
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "~/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import DeleteOne from "./delete-page"
import { type CommonDBReturn } from "~/server/queries"

export default function SearchPage<T extends Record<string, string | number>>(
    props: Readonly<{
        title: string
        description: string
        tableHeaders: string[]
        tableAttrs: string[]
        slug: string
        getManyQuery: (input: {
            take: number
            skip: number
            searchTerm: string
        }) => Promise<
            CommonDBReturn<{
                total: number
                rows: T[]
            }>
        >
        deleteOneQuery: (id: string) => Promise<CommonDBReturn<undefined>>
    }>,
) {
    const [rows, setRows] = useState<T[]>([])
    const [total, setTotal] = useState(0)
    const [getRowsDone, setGetRowsDone] = useState(false)
    const [showErrorIndicator, setShowErrorIndicator] = useState(false)

    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const toastDBRowsError = useCallback(
        (errorMessage: string | React.ReactNode) => {
            setShowErrorIndicator(true)
            toast(
                <span className="text-red-500">
                    Erro ao tentar buscar linhas: {errorMessage}
                </span>,
                {
                    duration: 5000,
                },
            )
        },
        [],
    )

    const changeURLParams = useCallback(
        (key: string, value?: string) => {
            const params = new URLSearchParams(searchParams)

            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }

            router.replace(`${pathname}?${params.toString()}`)
        },
        [searchParams, pathname, router],
    )

    const currentPage = useMemo(
        () => Number(searchParams.get("page")) || 1,
        [searchParams],
    )

    const currentTake = useMemo(
        () => Number(searchParams.get("take")) || 10,
        [searchParams],
    )

    const maxPage = useMemo(
        () => Math.ceil(total / currentTake),
        [total, currentTake],
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

    useEffect(() => {
        const getRows = async () => {
            const searchTerm = searchParams.get("search") ?? ""

            const result = await props.getManyQuery({
                take: currentTake,
                skip: currentTake * (currentPage - 1),
                searchTerm,
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
        }

        getRows().catch((e) => {
            toastDBRowsError((e as Error).message)
        })
    }, [props, currentPage, currentTake, toastDBRowsError, searchParams])

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
                        onChange={useDebouncedCallback(
                            (e) => changeURLParams("search", e.target.value),
                            500,
                        )}
                    />
                </div>
                <div>
                    <Select
                        defaultValue={searchParams.get("take")?.toString()}
                        onValueChange={(value) =>
                            changeURLParams("take", value)
                        }
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
                <Button className="h-7 p-5">
                    <Link href={`/admin/${props.slug}/create`}>
                        <PlusCircle />
                    </Link>
                </Button>
            </div>

            <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                    <CardTitle>{props.title}</CardTitle>
                    <CardDescription>{props.description}</CardDescription>
                </CardHeader>
                {!getRowsDone && !showErrorIndicator && (
                    <div className="flex w-full justify-center items-center">
                        <LoaderCircle
                            width={100}
                            height={100}
                            className="animate-spin"
                        ></LoaderCircle>
                    </div>
                )}
                {showErrorIndicator && (
                    <div className="flex w-full justify-center items-center">
                        <CircleX width={100} height={100} color="red"></CircleX>
                    </div>
                )}
                {getRowsDone && (
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="text-nowrap">
                                    {props.tableHeaders.map((text, index) => (
                                        <TableHead key={index}>
                                            {text}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {props.tableAttrs.map((attr) =>
                                            attr.includes("Url") ? (
                                                <TableCell
                                                    key={attr}
                                                    className="table-cell"
                                                >
                                                    <Image
                                                        alt="Product image"
                                                        className="aspect-square rounded-md object-cover"
                                                        src={
                                                            row[attr] as string
                                                        }
                                                        height="64"
                                                        width="64"
                                                    />
                                                </TableCell>
                                            ) : (
                                                <TableCell key={attr}>
                                                    {typeof row[attr] ===
                                                        "string" &&
                                                    row[attr].length > 20 ? (
                                                        <FieldTooLong
                                                            content={row[attr]}
                                                        ></FieldTooLong>
                                                    ) : (
                                                        row[attr]
                                                    )}
                                                </TableCell>
                                            ),
                                        )}
                                        <TableCell>
                                            <Dialog
                                                defaultOpen={
                                                    searchParams.get(
                                                        "DDeleteId",
                                                    ) === row.id ||
                                                    searchParams.get(
                                                        "UUpdateId",
                                                    ) === row.id
                                                }
                                                onOpenChange={(open) => {
                                                    if (open) {
                                                        return
                                                    }

                                                    searchParams.forEach(
                                                        (_, paramKey) => {
                                                            if (
                                                                paramKey.startsWith(
                                                                    "DDelete",
                                                                ) ||
                                                                paramKey.startsWith(
                                                                    "UUpdate",
                                                                )
                                                            ) {
                                                                console.log(
                                                                    paramKey,
                                                                )
                                                                changeURLParams(
                                                                    paramKey,
                                                                    undefined,
                                                                )
                                                            }
                                                        },
                                                    )
                                                }}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            aria-haspopup="true"
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Ações
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Link
                                                                href={`/admin/${props.slug}/update/${row.id}`}
                                                            >
                                                                Atualizar
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DialogTrigger
                                                            asChild
                                                            onClick={() => {
                                                                changeURLParams(
                                                                    "DDeleteId",
                                                                    String(
                                                                        row.id,
                                                                    ),
                                                                )
                                                            }}
                                                        >
                                                            <DropdownMenuItem>
                                                                Apagar
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <DialogContent>
                                                    <DeleteOne
                                                        dbMutation={() =>
                                                            props.deleteOneQuery(
                                                                searchParams.get(
                                                                    "DDeleteId",
                                                                ) ?? "",
                                                            )
                                                        }
                                                    ></DeleteOne>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}

                <CardFooter className="flex flex-row gap-2 text-sm justify-between">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={
                                        currentPage === 1
                                            ? "#"
                                            : getNextPageLink(-1)
                                    }
                                />
                            </PaginationItem>
                            <PaginationItem>
                                {currentPage > 1 && (
                                    <PaginationLink href={getNextPageLink(-1)}>
                                        {currentPage - 1}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>
                            {maxPage > currentPage && (
                                <PaginationLink href={getNextPageLink(1)}>
                                    {currentPage + 1}
                                </PaginationLink>
                            )}
                            <PaginationItem></PaginationItem>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    href={
                                        maxPage > currentPage
                                            ? getNextPageLink(1)
                                            : "#"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter>
            </Card>
        </main>
    )
}

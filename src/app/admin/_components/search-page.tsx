"use client"

import {
    MoreHorizontal,
    PlusCircle,
    ArrowLeft,
    ArrowRight,
    Search,
    LoaderCircle,
    CircleX,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
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
import { Label } from "~/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import FieldTooLong from "./field-too-long"

export default function SearchPage<
    T extends Record<string, string | number>,
>(props: {
    title: string
    description: string
    tableHeaders: string[]
    tableAttrs: string[]
    slug: string
    getManyQuery: (input: {
        take: number
        skip: number
        searchTerm: string
    }) => Promise<{
        success: boolean
        errorMessage: string
        data?: {
            total: number
            rows: T[]
        }
    }>
}) {
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(10)
    const [skip, setSkip] = useState(0)
    const [rows, setRows] = useState<T[]>([])
    const [total, setTotal] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [getRowsDone, setGetRowsDone] = useState(false)
    const [showErrorIndicator, setShowErrorIndicator] = useState(false)

    const toastDBRowsError = (errorMessage: string | React.ReactNode) => {
        setShowErrorIndicator(true)
        toast(
            <span className="text-red-500">
                Erro ao tentar buscar linhas: {errorMessage}
            </span>,
            {
                duration: 5000,
            },
        )
    }

    const { getManyQuery } = props

    useEffect(() => {
        const getRows = async () => {
            const result = await getManyQuery({
                take,
                skip,
                searchTerm,
            })

            if (!result.success) {
                toastDBRowsError(result.errorMessage)
                return
            }

            setGetRowsDone(true)

            if (result.data) {
                setRows(result.data.rows)
                setTotal(result.data.total)
            }
        }

        getRows().catch((e) => {
            toastDBRowsError((e as Error).message)
        })
    }, [getManyQuery, take, skip, searchTerm])

    return (
        <main className="flex flex-col p-2 gap-3">
            <div className="flex flex-row items-center p-2 gap-3">
                <div className="flex flex-row items-center gap-2">
                    <div className="relative ml-auto flex-1 md:grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Procure..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                            disabled={total <= 0}
                            onChange={useDebouncedCallback((e) => {
                                const value = e.target.value as string
                                setSearchTerm(value)
                            }, 500)}
                        />
                    </div>
                    <Label htmlFor="take">Linhas:</Label>
                    <Input
                        id="take"
                        disabled={total <= 0}
                        type="number"
                        className="w-10"
                        defaultValue={take}
                        onChange={useDebouncedCallback(
                            (e) =>
                                setTake(
                                    Math.floor(Number(e.target.value)) || 0,
                                ),
                            300,
                        )}
                    ></Input>
                </div>
                <Button className="h-7 ml-auto p-5">
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
                                                    <img
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
                                                    <DropdownMenuItem>
                                                        <Link
                                                            href={`/admin/${props.slug}/delete/${row.id}`}
                                                        >
                                                            Apagar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}

                <CardFooter className="flex flex-row gap-2 text-sm justify-between">
                    <div className="mr-auto flex gap-2">
                        {getRowsDone && (
                            <div>
                                Página {page}:
                                <span>
                                    {" "}
                                    Mostrando {rows.length} de {total}
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="button"
                        disabled={skip <= 0}
                        onClick={() => {
                            setSkip((prev) => prev - take)
                            setPage((prev) => prev - 1)
                        }}
                    >
                        <ArrowLeft></ArrowLeft>
                    </Button>
                    <Button
                        type="button"
                        disabled={rows.length + skip >= total}
                        onClick={() => {
                            setSkip((prev) => prev + take)
                            setPage((prev) => prev + 1)
                        }}
                    >
                        <ArrowRight></ArrowRight>
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}

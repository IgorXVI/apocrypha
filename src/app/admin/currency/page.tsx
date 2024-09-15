"use client"

import {
    MoreHorizontal,
    PlusCircle,
    ArrowLeft,
    ArrowRight,
    Search,
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
import { getManyCurrencies } from "~/server/queries"

function Row(props: { id: string; label: string; iso4217Code: string }) {
    return (
        <TableRow>
            <TableCell>{props.label}</TableCell>
            <TableCell>{props.iso4217Code}</TableCell>
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
                        <DropdownMenuItem>
                            <Link href={`/admin/currency/update/${props.id}`}>
                                Atualizar
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={`/admin/currency/delete/${props.id}`}>
                                Apagar
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

export default function Currencies() {
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(10)
    const [skip, setSkip] = useState(0)
    const [rows, setRows] = useState([
        {
            id: "",
            label: "",
            iso4217Code: "",
        },
    ])
    const [total, setTotal] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")

    const toastDBRowsError = (errorMessage: string | React.ReactNode) => {
        toast(
            <span className="text-red-500">
                Erro ao tentar buscar linhas: {errorMessage}
            </span>,
        )
    }

    useEffect(() => {
        const getRows = async () => {
            const result = await getManyCurrencies({
                take,
                skip,
                searchTerm,
            })

            if (!result.success) {
                toastDBRowsError(result.errorMessage)
                return
            }

            if (result.data) {
                setRows(result.data.currencies)
                setTotal(result.data.total)
            }
        }

        getRows().catch((e) => toastDBRowsError((e as Error).message))
    }, [take, skip, searchTerm])

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
                    <Link href="/admin/currency/create">
                        <PlusCircle />
                    </Link>
                </Button>
            </div>

            <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                    <CardTitle>Moedas</CardTitle>
                    <CardDescription>
                        Crie, atualize, apague ou busque as moedas cadastradas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="text-nowrap">
                                <TableHead>Prefixo</TableHead>
                                <TableHead>Código</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <Row key={row.id} {...row}></Row>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex flex-row gap-2 text-sm justify-between">
                    <div className="mr-auto flex gap-2">
                        Página {page}:
                        {total > 0 && (
                            <span>
                                Mostrando {rows.length} de {total}
                            </span>
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

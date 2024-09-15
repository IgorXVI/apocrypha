"use client"

import { MoreHorizontal, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
import { dbQueryWithToast } from "~/lib/toasting"
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
    const [take, setTake] = useState(5)
    const [skip, setSkip] = useState(0)
    const [rows, setRows] = useState([
        {
            id: "",
            label: "",
            iso4217Code: "",
        },
    ])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const getRows = async () => {
            const data = await dbQueryWithToast({
                dbQuery: () =>
                    getManyCurrencies({
                        take,
                        skip,
                    }),
                mutationName: "getting-currencies",
                waitingMessage: "Buscando moedas...",
                successMessage: "Moedas buscadas",
            })

            if (data) {
                setRows(data.currencies)
                setTotal(data.total)
            }
        }

        getRows().catch((e) =>
            toast(
                <span className="text-red-500">
                    Erro ao tentar buscar linhas: {(e as Error).message}
                </span>,
            ),
        )
    }, [take, skip])

    return (
        <main className="flex flex-col p-2 gap-3">
            <div className="flex flex-row items-center p-2">
                <div className="flex flex-row items-center gap-2">
                    <Label htmlFor="take">Linhas por página:</Label>
                    <Input
                        id="take"
                        type="number"
                        className="w-10"
                        value={take}
                        onChange={(e) => {
                            setTake(Number(e.target.value) || 0)
                        }}
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
                <CardFooter className="flex flex-row gap-2">
                    Mostrando {rows.length} de {total}
                    {rows.length + skip < total && (
                        <Button
                            type="button"
                            onClick={() => setSkip((prev) => prev + take)}
                        >
                            Próxima
                        </Button>
                    )}
                    {skip > 0 && (
                        <Button
                            type="button"
                            onClick={() => setSkip((prev) => prev - take)}
                        >
                            Anterior
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </main>
    )
}

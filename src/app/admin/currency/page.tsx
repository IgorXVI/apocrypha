import { MoreHorizontal, PlusCircle } from "lucide-react"
import Link from "next/link"

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { getAllCurrencies } from "~/server/queries"

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

export default async function Currencies() {
    const { currencies } = await getAllCurrencies()

    return (
        <main className="flex flex-col p-2 gap-3">
            <div className="ml-auto flex items-center gap-2">
                <Button className="h-7">
                    <Link href="/admin/currency/create">
                        <PlusCircle className="h-3.5 w-3.5" />
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
                            {currencies.map((c) => (
                                <Row key={c.id} {...c}></Row>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>PAGINAÇÃO</CardFooter>
            </Card>
        </main>
    )
}

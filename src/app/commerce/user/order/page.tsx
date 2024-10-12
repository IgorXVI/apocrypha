import { auth } from "@clerk/nextjs/server"
import { CalendarIcon, CreditCardIcon, PackageIcon } from "lucide-react"
import Link from "next/link"
import OrderStatus from "~/components/order/order-status"
import PaginationNumbers from "~/components/pagination/pagination-numbers"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { calcSkip } from "~/lib/utils"
import { authClient } from "~/server/auth-api"
import { db } from "~/server/db"

export default async function UserOrders({
    searchParams,
}: {
    searchParams: {
        page?: string
    }
}) {
    const user = auth()

    if (!user.userId) {
        return <p>Não autorizado.</p>
    }

    const userData = await authClient.users.getUser(user.userId)

    const currentPage = Number(searchParams.page) || 1
    const currentTake = 10

    const [ordersStats, orders] = await Promise.all([
        db.order.aggregate({
            where: {
                userId: user.userId,
            },
            _count: true,
            _sum: {
                totalPrice: true,
            },
            _avg: {
                totalPrice: true,
            },
        }),
        db.order.findMany({
            where: {
                userId: user.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: currentTake,
            skip: calcSkip(currentPage, currentTake),
        }),
    ])

    return (
        <div className="container mx-auto px-4 py-8">
            {orders.length > 0 ? (
                <>
                    <h1 className="text-3xl font-bold mb-8">
                        Seus pedidos, <span className="text-nowrap">{userData.fullName}</span>
                    </h1>

                    <div className="grid gap-6 md:grid-cols-3 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Número de pedidos</CardTitle>
                                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{ordersStats._count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                                <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">R$ {ordersStats._sum.totalPrice?.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Média de gastos por pedido</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">R$ {ordersStats._avg.totalPrice?.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos</CardTitle>
                            <CardDescription>Lista dos seus pedidos na Apocrypha</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Link href={`/commerce/user/order/${order.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Ver detalhes
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[150px]">
                                                    <OrderStatus status={order.status}></OrderStatus>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-nowrap">{order.createdAt.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-nowrap">R$ {order.totalPrice.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>

                        <CardFooter className="grid place-content-center">
                            <PaginationNumbers
                                urlPageParamName="page"
                                total={ordersStats._count}
                                page={currentPage}
                                take={currentTake}
                            ></PaginationNumbers>
                        </CardFooter>
                    </Card>
                </>
            ) : (
                <div className="text-center min-h-[50vh] flex flex-col justify-center items-center">
                    <p className="text-3xl mb-4">Você não fez nenhum pedido ainda</p>
                    <Button asChild>
                        <Link href="/commerce">Continuar comprando</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}

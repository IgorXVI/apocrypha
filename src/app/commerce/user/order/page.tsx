import { CalendarIcon, CreditCardIcon, PackageIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

// Mock data for the user and their orders
const user = {
    name: "Alice Johnson",
    totalOrders: 12,
    totalSpent: 1234.56,
    averageOrderValue: 102.88,
}

const orders = [
    { id: "ORD001", date: "2023-05-01", status: "Delivered", total: 125.99 },
    { id: "ORD002", date: "2023-05-15", status: "Shipped", total: 89.99 },
    { id: "ORD003", date: "2023-05-28", status: "Processing", total: 199.99 },
    { id: "ORD004", date: "2023-06-10", status: "Delivered", total: 79.99 },
    { id: "ORD005", date: "2023-06-22", status: "Cancelled", total: 149.99 },
]

const decideButtonVarient = (status: string) =>
    status === "Delivered" ? "default" : status === "Shipped" ? "secondary" : status === "Processing" ? "outline" : "destructive"

export default function UserOrders() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Orders, {user.name}</h1>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <PackageIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${user.totalSpent.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${user.averageOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>A list of all your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={decideButtonVarient(order.status)}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={`/commerce/user/order/${order.id}`}
                                                className="w-full h-full grid place-content-center"
                                            >
                                                View Details
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

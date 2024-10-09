import { CalendarIcon, CreditCard, Package, Truck } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

// Mock data for the order
const order = {
    id: "ORD12345",
    date: "2023-06-15",
    status: "Delivered",
    total: 234.99,
    items: [
        { id: 1, name: "Wireless Earbuds", quantity: 1, price: 79.99 },
        { id: 2, name: "Smartphone Case", quantity: 2, price: 24.99 },
        { id: 3, name: "USB-C Cable", quantity: 3, price: 15.99 },
    ],
    shipping: {
        method: "Standard Shipping",
        address: "123 Main St, Anytown, AN 12345",
        cost: 9.99,
    },
    payment: {
        method: "Credit Card",
        cardLast4: "1234",
    },
}

export default function OrderDetails() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Order Details</h1>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span>{order.date}</span>
                    </div>
                    <Badge
                        variant="outline"
                        className="text-lg py-1"
                    >
                        {order.status}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>Order ID: {order.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-medium"
                                    >
                                        Subtotal
                                    </TableCell>
                                    <TableCell className="text-right">${(order.total - order.shipping.cost).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-medium"
                                    >
                                        Shipping
                                    </TableCell>
                                    <TableCell className="text-right">${order.shipping.cost.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-bold"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-bold">${order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Shipping Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.shipping.method}</p>
                            <p className="text-muted-foreground mt-2">{order.shipping.address}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.payment.method}</p>
                            <p className="text-muted-foreground mt-2">Card ending in {order.payment.cardLast4}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="text-lg py-1"
                                >
                                    {order.status}
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Track Order</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, BarChart3, BookOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderStatus =
    | "AWAITING_CONFIRMATION"
    | "CANCELED"
    | "CONFIRMED"
    | "POSTED"
    | "DONE"
    | "REQUESTED_RETURN"
    | "REFUSED_RETURN"
    | "AWAITING_RETURN"
    | "RETURN_DONE"

interface Order {
    id: string
    price: number
    userName: string
    userEmail: string
    status: OrderStatus
    shippingMethod: string
    estimatedDeliveryDate: string
    createdAt: Date
    updatedAt: Date
    books: string[]
}

const initialOrders: Order[] = [
    {
        id: "1",
        price: 29.99,
        userName: "John Doe",
        userEmail: "john@example.com",
        status: "AWAITING_CONFIRMATION",
        shippingMethod: "Standard",
        estimatedDeliveryDate: "2023-07-15",
        createdAt: new Date("2023-07-01T10:00:00"),
        updatedAt: new Date("2023-07-01T10:00:00"),
        books: ["The Great Gatsby"],
    },
    {
        id: "2",
        price: 39.99,
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        status: "CONFIRMED",
        shippingMethod: "Express",
        estimatedDeliveryDate: "2023-07-10",
        createdAt: new Date("2023-07-02T14:30:00"),
        updatedAt: new Date("2023-07-02T15:00:00"),
        books: ["To Kill a Mockingbird", "1984"],
    },
    {
        id: "3",
        price: 19.99,
        userName: "Bob Johnson",
        userEmail: "bob@example.com",
        status: "POSTED",
        shippingMethod: "Standard",
        estimatedDeliveryDate: "2023-07-18",
        createdAt: new Date("2023-06-30T09:15:00"),
        updatedAt: new Date("2023-07-01T11:30:00"),
        books: ["1984"],
    },
    {
        id: "4",
        price: 24.99,
        userName: "Alice Brown",
        userEmail: "alice@example.com",
        status: "DONE",
        shippingMethod: "Express",
        estimatedDeliveryDate: "2023-07-05",
        createdAt: new Date("2023-06-28T16:45:00"),
        updatedAt: new Date("2023-07-05T09:00:00"),
        books: ["The Great Gatsby", "Pride and Prejudice"],
    },
    {
        id: "5",
        price: 34.99,
        userName: "Charlie Wilson",
        userEmail: "charlie@example.com",
        status: "REQUESTED_RETURN",
        shippingMethod: "Standard",
        estimatedDeliveryDate: "2023-07-20",
        createdAt: new Date("2023-07-03T11:20:00"),
        updatedAt: new Date("2023-07-06T14:15:00"),
        books: ["To Kill a Mockingbird"],
    },
]

export default function BookOrderManagement() {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [sortField, setSortField] = useState<"createdAt" | "price">("createdAt")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [filterUserName, setFilterUserName] = useState("")
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL")
    const [filterBook, setFilterBook] = useState("")

    const sortedAndFilteredOrders = useMemo(() => {
        return orders
            .filter(
                (order) =>
                    order.userName.toLowerCase().includes(filterUserName.toLowerCase()) &&
                    (filterStatus === "ALL" || order.status === filterStatus) &&
                    (filterBook === "" || order.books.some((book) => book.toLowerCase().includes(filterBook.toLowerCase()))),
            )
            .sort((a, b) => {
                if (sortDirection === "asc") {
                    return a[sortField] > b[sortField] ? 1 : -1
                } else {
                    return a[sortField] < b[sortField] ? 1 : -1
                }
            })
    }, [orders, sortField, sortDirection, filterUserName, filterStatus, filterBook])

    const toggleSortDirection = () => {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    }

    const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order)))
    }

    const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
        switch (currentStatus) {
            case "AWAITING_CONFIRMATION":
                return ["CANCELED", "CONFIRMED"]
            case "REQUESTED_RETURN":
                return ["REFUSED_RETURN", "AWAITING_RETURN"]
            case "AWAITING_RETURN":
                return ["RETURN_DONE"]
            default:
                return []
        }
    }

    const averageAmountPerMonth = useMemo(() => {
        const totalAmount = orders.reduce((sum, order) => sum + order.price, 0)
        const monthsDiff = new Date().getMonth() - orders[0].createdAt.getMonth() + 1
        return totalAmount / monthsDiff
    }, [orders])

    const salesPerBook = useMemo(() => {
        const sales: { [key: string]: number } = {}
        orders.forEach((order) => {
            order.books.forEach((book) => {
                sales[book] = (sales[book] || 0) + order.price / order.books.length
            })
        })
        return Object.entries(sales).map(([title, amount]) => ({ title, amount }))
    }, [orders])

    return (
        <div className="container mx-auto p-4">
            <Tabs
                defaultValue="orders"
                className="w-full"
            >
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    </TabsList>
                    <Button variant="outline">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Modify Database Data
                    </Button>
                </div>
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Book Order Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1">
                                    <Label htmlFor="filterUserName">Filter by User Name</Label>
                                    <Input
                                        id="filterUserName"
                                        placeholder="Enter user name"
                                        value={filterUserName}
                                        onChange={(e) => setFilterUserName(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="filterStatus">Filter by Status</Label>
                                    <Select
                                        value={filterStatus}
                                        onValueChange={(value) => setFilterStatus(value as OrderStatus | "ALL")}
                                    >
                                        <SelectTrigger id="filterStatus">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Statuses</SelectItem>
                                            {Object.values(OrderStatus).map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="filterBook">Filter by Book</Label>
                                    <Input
                                        id="filterBook"
                                        placeholder="Enter book title"
                                        value={filterBook}
                                        onChange={(e) => setFilterBook(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="font-semibold"
                                                onClick={() => {
                                                    if (sortField === "price") {
                                                        toggleSortDirection()
                                                    } else {
                                                        setSortField("price")
                                                        setSortDirection("asc")
                                                    }
                                                }}
                                            >
                                                Price
                                                {sortField === "price" &&
                                                    (sortDirection === "asc" ? (
                                                        <ChevronUp className="ml-2 h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="ml-2 h-4 w-4" />
                                                    ))}
                                            </Button>
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Shipping Method</TableHead>
                                        <TableHead>Estimated Delivery</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="font-semibold"
                                                onClick={() => {
                                                    if (sortField === "createdAt") {
                                                        toggleSortDirection()
                                                    } else {
                                                        setSortField("createdAt")
                                                        setSortDirection("desc")
                                                    }
                                                }}
                                            >
                                                Created At
                                                {sortField === "createdAt" &&
                                                    (sortDirection === "asc" ? (
                                                        <ChevronUp className="ml-2 h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="ml-2 h-4 w-4" />
                                                    ))}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Updated At</TableHead>
                                        <TableHead>Books</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAndFilteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>${order.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                {order.userName}
                                                <br />
                                                <span className="text-sm text-muted-foreground">{order.userEmail}</span>
                                            </TableCell>
                                            <TableCell>{order.status}</TableCell>
                                            <TableCell>{order.shippingMethod}</TableCell>
                                            <TableCell>{order.estimatedDeliveryDate}</TableCell>
                                            <TableCell>{order.createdAt.toLocaleString()}</TableCell>
                                            <TableCell>{order.updatedAt.toLocaleString()}</TableCell>
                                            <TableCell>{order.books.join(", ")}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Change Status
                                                            <ChevronDown className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {getAvailableStatuses(order.status).map((status) => (
                                                            <DropdownMenuItem
                                                                key={status}
                                                                onClick={() => updateOrderStatus(order.id, status)}
                                                            >
                                                                {status}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="statistics">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Amount per Month</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${averageAmountPerMonth.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales per Book Title</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ChartContainer
                                    config={{
                                        amount: {
                                            label: "Amount",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    }}
                                    className="h-[200px]"
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={salesPerBook}>
                                            <XAxis dataKey="title" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar
                                                dataKey="amount"
                                                fill="var(--color-amount)"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

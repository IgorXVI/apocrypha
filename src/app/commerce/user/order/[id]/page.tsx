import * as _ from "lodash"

import { BookOpenIcon, BoxesIcon, CalendarIcon, CreditCard, Package, StarsIcon, TagIcon, TagsIcon, Truck } from "lucide-react"
import OrderStatus from "~/components/order/order-status"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { db } from "~/server/db"
import { getProductInfo } from "~/server/shipping-api"
import { stripe } from "~/server/stripe-api"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@clerk/nextjs/server"

const formatStripeName = (name: string) =>
    name
        .split("_")
        .map((t) => _.capitalize(t))
        .join(" ")

const cardType = new Map<string, string>([
    ["debit", "debito"],
    ["credit", "crédito"],
])

export default async function OrderDetails({ params: { id } }: { params: { id: string } }) {
    const user = auth()

    if (!user.userId) {
        return <p>Não autorizado</p>
    }

    const order = await db.order.findUnique({
        where: {
            id,
        },
        include: {
            BookOnOrder: {
                include: {
                    Book: {
                        include: {
                            DisplayImage: {
                                select: {
                                    url: true,
                                },
                                orderBy: {
                                    order: "asc",
                                },
                                take: 1,
                            },
                            Review: {
                                where: {
                                    userId: user.userId,
                                },
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!order) {
        return <p>Pedido não foi encontrado.</p>
    }

    const ticketInfo = order.ticketId
        ? await getProductInfo(order.ticketId).catch((error) => {
              console.error("TICKET_INFO_ERROR_USER_ORDER_DETAILS", error)
              return undefined
          })
        : undefined

    const stripePaymentInfo = order.paymentId ? await stripe.paymentIntents.retrieve(order.paymentId) : undefined

    const paymentMethod = stripePaymentInfo ? await stripe.paymentMethods.retrieve(stripePaymentInfo.payment_method?.toString() ?? "") : undefined

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Detalhes do pedido</h1>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span>{order.createdAt.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Resumo do pedido</CardTitle>
                        <CardDescription>ID: {order.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table className="md:text-lg">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <div className="flex flex-row gap-1 items-center justify-start">
                                            <BookOpenIcon></BookOpenIcon>
                                            <span className="hidden md:block">Item</span>
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex flex-row gap-1 items-center justify-end">
                                            <BoxesIcon></BoxesIcon>
                                            <span className="hidden md:block">Quantidade</span>
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex flex-row gap-1 items-center justify-end">
                                            <TagIcon></TagIcon>
                                            <span className="hidden md:block">Preço</span>
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex flex-row gap-1 items-center justify-end">
                                            <TagsIcon></TagsIcon>
                                            <span className="hidden md:block">Total</span>
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.BookOnOrder.map((bo) => (
                                    <TableRow key={bo.Book.id}>
                                        <TableCell>
                                            <div className="flex flex-col gap-3 justify-center items-center md:items-start">
                                                <Link href={`/commerce/book/${bo.Book.id}`}>
                                                    <Image
                                                        src={bo.Book.DisplayImage[0]?.url ?? ""}
                                                        alt={bo.Book.title}
                                                        className="min-h-[150px] min-w-[100px] max-h-[150px] max-w-[100px] rounded-lg object-cover"
                                                        width={100}
                                                        height={150}
                                                    ></Image>
                                                </Link>
                                                <div className={`${order.status === "DELIVERED" ? "block" : "hidden"}`}>
                                                    <Link href={`/commerce/user/review/book/${bo.Book.id}`}>
                                                        <div
                                                            className="flex flex-row gap-2 bg-yellow-500 hover:bg-yellow-400 transition-all duration-300 
                                                                    text-white py-1 px-3 rounded-lg items-center justify-center"
                                                        >
                                                            <StarsIcon></StarsIcon>
                                                            <span className="tex-sm md:text-base">
                                                                {bo.Book.Review[0] ? "Edite sua avaliação" : "Avalie"}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{bo.amount}</TableCell>
                                        <TableCell className="text-right text-nowrap">R$ {bo.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-nowrap">R$ {(bo.amount * bo.price.toNumber()).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-medium"
                                    >
                                        Subtotal
                                    </TableCell>
                                    <TableCell className="text-right text-nowrap ">
                                        R${" "}
                                        {order.totalPrice && order.shippingPrice
                                            ? (order.totalPrice.toNumber() - order.shippingPrice?.toNumber()).toFixed(2)
                                            : "N/A"}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-medium"
                                    >
                                        Entrega
                                    </TableCell>
                                    <TableCell className="text-right text-nowrap">R$ {order.shippingPrice?.toFixed(2) ?? "N/A"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-bold"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell className="text-nowrap text-right font-bold text-lg md:text-2xl text-green-500">
                                        R$ {order.totalPrice?.toFixed(2) ?? "N/A"}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    {ticketInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Informação da entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{order.shippingServiceName}</p>
                                <p className="text-muted-foreground mt-2">Entregar para {ticketInfo.to.name}</p>
                                <p className="text-muted-foreground mt-2">
                                    {ticketInfo.to.city}/{ticketInfo.to.state_abbr}, {ticketInfo.to.postal_code}
                                </p>
                                <p className="text-muted-foreground mt-2">
                                    {ticketInfo.to.address}, {ticketInfo.to.district}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {paymentMethod && paymentMethod.type === "card" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Informação do pagamento
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="font-medium">
                                    Cartão de {cardType.get(paymentMethod.card?.funding ?? "") ?? paymentMethod.card?.funding}{" "}
                                    {formatStripeName(paymentMethod.card?.brand ?? "")}
                                    {paymentMethod.card?.wallet && (
                                        <span> pela carteira digital {formatStripeName(paymentMethod.card?.wallet.type)}</span>
                                    )}
                                </p>
                                <p className="text-muted-foreground mt-2">Cartão terminando em {paymentMethod.card?.last4}</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3 text-2xl justify-center items-center">
                                <OrderStatus
                                    className="px-4"
                                    status={order.status}
                                ></OrderStatus>
                                <span className="text-muted-foreground text-lg font-light text-nowrap">
                                    Atualizado em: {order.updatedAt.toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                        {order.tracking && (
                            <CardFooter>
                                <a
                                    href={`https://www.linkcorreios.com.br/?id=${order.tracking}`}
                                    className="w-full"
                                >
                                    <Button className="w-full">Rastrear envio</Button>
                                </a>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

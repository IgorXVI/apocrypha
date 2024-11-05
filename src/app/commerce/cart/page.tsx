"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"

import { mainApi } from "~/lib/redux/apis/main-api/main"
import { useAppSelector, useAppDispatch } from "~/lib/redux/hooks"
import { bookCartSlice } from "~/lib/redux/book-cart/bookCartSlice"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { dbQueryWithToast } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useState } from "react"

export default function CartPage() {
    const dispatch = useAppDispatch()
    const cartContent = useAppSelector((state) => state.bookCart.value)
    const router = useRouter()
    const [triggerCheckout] = mainApi.useCheckoutMutation()
    const [isDisabled, setIsDisabled] = useState(false)

    const updateQuantity = (id: string, newQuantity: number, stock: number) => {
        if (newQuantity < 1) return

        const amount = stock < newQuantity ? stock : newQuantity

        dispatch(bookCartSlice.actions.updateAmount({ id, amount }))
    }

    const removeItem = (id: string) => {
        dispatch(bookCartSlice.actions.remove(id))
    }

    const total = cartContent.reduce((sum, item) => sum + item.price * item.amount, 0)

    const handleCheckout = async () => {
        const products = cartContent.map((item) => ({
            stripeId: item.stripeId,
            quantity: item.amount,
        }))

        setIsDisabled(true)

        const stripeUrl = await dbQueryWithToast({
            dbQuery: () =>
                triggerCheckout({ data: { products } })
                    .then((result) => {
                        if (result.error) {
                            if ("data" in result.error) {
                                const errorData = result.error.data as Record<string, string> | undefined
                                if (errorData?.errorMessage === "User has no address.") {
                                    throw new Error("Por favor, cadastre o seu endereço.")
                                }
                            }

                            throw new Error(JSON.stringify(result.error))
                        }

                        if (!result.data.success) {
                            throw new Error(result.data.errorMessage)
                        }

                        return {
                            data: result.data.url,
                            success: true,
                            errorMessage: "",
                        }
                    })
                    .catch((error) => ({
                        data: undefined,
                        success: false,
                        errorMessage: (error as Error).message,
                    })),
            mutationName: "checkout",
            waitingMessage: "Finalizando compra...",
            successMessage: "Redirecionando para o Stripe...",
        })

        if (stripeUrl) {
            router.push(stripeUrl)
        }
    }

    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Carrinho de compras</h1>

            {cartContent.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="md:hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Produto</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead className="text-right">Preço</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cartContent.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Link
                                                href={`/commerce/book/${item.id}`}
                                                className="w-full h-full"
                                            >
                                                <Image
                                                    src={item.mainImg}
                                                    alt={`Cover of ${item.title}`}
                                                    className="w-16 h-20 object-cover"
                                                    width={100}
                                                    height={100}
                                                />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    disabled={isDisabled}
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.amount - 1, item.stock)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    disabled={isDisabled}
                                                    type="number"
                                                    min="1"
                                                    value={item.amount}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.stock)}
                                                    className="w-16 text-center"
                                                />
                                                <Button
                                                    disabled={isDisabled}
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.amount + 1, item.stock)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-nowrap">R$ {(item.price * item.amount).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="lg:w-2/3 hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Produto</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead className="text-right">Preço</TableHead>
                                    <TableHead className="w-[100px]">Excluir</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cartContent.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Link
                                                href={`/commerce/book/${item.id}`}
                                                className="w-full h-full"
                                            >
                                                <Image
                                                    src={item.mainImg}
                                                    alt={`Cover of ${item.title}`}
                                                    className="w-16 h-20 object-cover"
                                                    width={100}
                                                    height={100}
                                                />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Link
                                                    href={`/commerce/book/${item.id}`}
                                                    className="hover:underline"
                                                >
                                                    <span className="font-semibold">{item.title}</span>
                                                </Link>

                                                <Link
                                                    href={`/commerce/author/${item.authorId}`}
                                                    className="hover:underline"
                                                >
                                                    <span className="text-sm text-muted-foreground">{item.author}</span>
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    disabled={isDisabled}
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.amount - 1, item.stock)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    disabled={isDisabled}
                                                    type="number"
                                                    min="1"
                                                    value={item.amount}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.stock)}
                                                    className="w-16 text-center"
                                                />
                                                <Button
                                                    disabled={isDisabled}
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.amount + 1, item.stock)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-nowrap">R$ {(item.price * item.amount).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={isDisabled}
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-muted p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Resumo do pedido</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>R$ {total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-6"
                                type="button"
                                disabled={isDisabled}
                                onClick={handleCheckout}
                            >
                                Finalizar compra
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center min-h-[50vh] flex flex-col justify-center items-center">
                    <p className="text-3xl mb-4">Seu carrinho está vazio</p>
                    <Button asChild>
                        <Link href="/commerce/book">Continuar comprando</Link>
                    </Button>
                </div>
            )}
        </main>
    )
}

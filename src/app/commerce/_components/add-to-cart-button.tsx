"use client"

import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "~/components/ui/button"
import { bookCartSlice, type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks"

export default function AddToCartButton({ bookForCart, showButtonText = false }: { bookForCart: BookCartState; showButtonText?: boolean }) {
    const dispatch = useAppDispatch()
    const cartContent = useAppSelector((state) => state.bookCart.value)

    const isInCart = useMemo(() => cartContent.some((item) => item.id === bookForCart.id), [cartContent, bookForCart.id])

    return (
        <Button
            size="sm"
            className="flex flex-col items-center"
            variant={isInCart ? "destructive" : "default"}
            onClick={() => (isInCart ? dispatch(bookCartSlice.actions.removeAmount(bookForCart)) : dispatch(bookCartSlice.actions.add(bookForCart)))}
        >
            {isInCart ? (
                <span className="flex items-center">
                    {showButtonText && <span className="mr-4">Remover do carrinho</span>} <MinusIcon size={16}></MinusIcon>{" "}
                    <ShoppingCartIcon size={16}></ShoppingCartIcon>
                </span>
            ) : (
                <span className="flex items-center">
                    {showButtonText && <span className="mr-4">Adicionar ao carrinho</span>} <PlusIcon size={16}></PlusIcon>{" "}
                    <ShoppingCartIcon size={16}></ShoppingCartIcon>
                </span>
            )}
        </Button>
    )
}

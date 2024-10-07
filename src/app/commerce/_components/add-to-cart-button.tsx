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

    const iconsSize = useMemo(() => (showButtonText ? 32 : 24), [])

    return (
        <Button
            size={showButtonText ? "lg" : "sm"}
            className="flex flex-col items-center"
            variant={isInCart ? "destructive" : "default"}
            onClick={() => (isInCart ? dispatch(bookCartSlice.actions.removeAmount(bookForCart)) : dispatch(bookCartSlice.actions.add(bookForCart)))}
        >
            {isInCart ? (
                <span className="flex items-center gap-1">
                    {showButtonText && <span className="mr-4 text-2xl">Devolver</span>} <MinusIcon size={iconsSize}></MinusIcon>
                    <ShoppingCartIcon size={iconsSize}></ShoppingCartIcon>
                </span>
            ) : (
                <span className="flex items-center gap-1">
                    {showButtonText && <span className="mr-4 text-2xl">Comprar</span>} <PlusIcon size={iconsSize}></PlusIcon>
                    <ShoppingCartIcon size={iconsSize}></ShoppingCartIcon>
                </span>
            )}
        </Button>
    )
}

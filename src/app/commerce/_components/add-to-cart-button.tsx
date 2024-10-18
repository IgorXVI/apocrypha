"use client"

import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "~/components/ui/button"
import { bookCartSlice } from "~/lib/redux/book-cart/bookCartSlice"
import { type BookClientSideState } from "~/lib/types"
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks"

export default function AddToCartButton({ bookForCart, large = false }: { bookForCart: BookClientSideState; large?: boolean }) {
    const dispatch = useAppDispatch()
    const cartContent = useAppSelector((state) => state.bookCart.value)

    const isInCart = useMemo(() => cartContent.some((item) => item.id === bookForCart.id), [cartContent, bookForCart.id])

    const iconsSize = useMemo(() => (large ? 32 : 24), [large])

    return (
        <Button
            disabled={bookForCart.stock <= 0}
            size={large ? "lg" : "sm"}
            className="flex flex-col items-center"
            variant={bookForCart.stock <= 0 ? "outline" : isInCart ? "destructive" : "default"}
            onClick={() => (isInCart ? dispatch(bookCartSlice.actions.removeAmount(bookForCart)) : dispatch(bookCartSlice.actions.add(bookForCart)))}
        >
            {bookForCart.stock <= 0 ? (
                <span className={`text-center ${large ? "text-2xl" : "text-lg"}`}>Esgotado</span>
            ) : isInCart ? (
                <span className="flex items-center gap-1">
                    <span className={`mr-4 ${large ? "text-2xl" : "text-lg"}`}>Devolver</span>
                    <MinusIcon></MinusIcon>
                    <ShoppingCartIcon size={iconsSize}></ShoppingCartIcon>
                </span>
            ) : (
                <span className="flex items-center gap-1">
                    <span className={`mr-4 ${large ? "text-2xl" : "text-lg"}`}>Comprar</span>
                    <PlusIcon></PlusIcon>
                    <ShoppingCartIcon size={iconsSize}></ShoppingCartIcon>
                </span>
            )}
        </Button>
    )
}

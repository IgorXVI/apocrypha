"use client"

import { useMemo } from "react"
import { Button } from "~/components/ui/button"
import { bookCartSlice, type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks"

export default function AddToCartButton(props: BookCartState) {
    const dispatch = useAppDispatch()
    const cartContent = useAppSelector((state) => state.bookCart.value)

    const isInCart = useMemo(() => cartContent.some((item) => item.id === props.id), [cartContent, props.id])

    return (
        <Button
            variant={isInCart ? "destructive" : "default"}
            onClick={() => (isInCart ? dispatch(bookCartSlice.actions.remove(props)) : dispatch(bookCartSlice.actions.add(props)))}
        >
            {isInCart ? "Remover do carrinho" : "Adicionar ao carrinho"}
        </Button>
    )
}

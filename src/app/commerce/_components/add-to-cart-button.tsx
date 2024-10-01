"use client"

import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
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
            className="flex flex-col items-center"
            variant={isInCart ? "destructive" : "default"}
            onClick={() => (isInCart ? dispatch(bookCartSlice.actions.removeAmount(props)) : dispatch(bookCartSlice.actions.add(props)))}
        >
            {isInCart ? (
                <span className="flex items-center">
                    <MinusIcon size={16}></MinusIcon> <ShoppingCartIcon></ShoppingCartIcon>
                </span>
            ) : (
                <span className="flex items-center">
                    <PlusIcon size={16}></PlusIcon> <ShoppingCartIcon></ShoppingCartIcon>
                </span>
            )}
        </Button>
    )
}

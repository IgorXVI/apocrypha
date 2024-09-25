"use client"

import { Button } from "~/components/ui/button"
import { bookCartSlice, type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { useAppDispatch } from "~/lib/redux/hooks"

export default function AddToCartButton(props: BookCartState) {
    const dispatch = useAppDispatch()

    return <Button onClick={() => dispatch(bookCartSlice.actions.add(props))}>Adicionar ao carrinho</Button>
}

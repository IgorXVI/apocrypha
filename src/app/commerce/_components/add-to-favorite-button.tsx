"use client"

import { HeartIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "~/components/ui/button"
import { type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { bookFavsSlice } from "~/lib/redux/book-favs/bookFavsSlice"
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks"

export default function AddToFavoriteButton({ book, size }: { book: BookCartState; size: number }) {
    const dispatch = useAppDispatch()
    const bookFavs = useAppSelector((state) => state.bookFavs.value)

    const isFav = useMemo(() => bookFavs.find((b) => b.id === book.id) ?? false, [bookFavs, book.id])

    const toggleFav = () => {
        if (isFav) {
            dispatch(bookFavsSlice.actions.remove(book.id))
        } else {
            dispatch(bookFavsSlice.actions.add(book))
        }
    }

    return (
        <Button
            variant="link"
            size="icon"
            className="hover:scale-150 transition-all duration-300"
            onClick={toggleFav}
        >
            <HeartIcon
                size={size}
                fill={isFav ? "red" : "white"}
                color="black"
            ></HeartIcon>
        </Button>
    )
}

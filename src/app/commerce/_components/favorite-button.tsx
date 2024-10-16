"use client"

import { HeartIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "~/components/ui/button"
import { bookFavsSlice } from "~/lib/redux/book-favs/bookFavsSlice"
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks"

export default function FavoriteButton({ bookId, size }: { bookId: string; size: number }) {
    const dispatch = useAppDispatch()
    const isFavMap = useAppSelector((state) => state.bookFavs.value)

    const isFav = useMemo(() => isFavMap[bookId] ?? false, [bookId, isFavMap])

    const isLoading = false

    const toggleFav = () => {
        if (isFav) {
            dispatch(bookFavsSlice.actions.remove(bookId))
        } else {
            dispatch(bookFavsSlice.actions.add(bookId))
        }
    }

    return (
        <Button
            variant="link"
            size="icon"
            disabled={isLoading}
            onClick={toggleFav}
        >
            <HeartIcon
                size={size}
                fill={isFav ? "red" : "white"}
                color="black"
                className={`${isLoading && "animate-pulse"}`}
            ></HeartIcon>
        </Button>
    )
}

"use client"

import { HeartIcon } from "lucide-react"
import { useMemo } from "react"
import { toastError } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { mainApi } from "~/lib/redux/apis/main-api/main"
import { bookFavsSlice } from "~/lib/redux/book-favs/bookFavsSlice"
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks"

export default function FavoriteButton({ bookId, size }: { bookId: string; size: number }) {
    const dispatch = useAppDispatch()
    const isFavMap = useAppSelector((state) => state.bookFavs.value)
    const favBookQuery = mainApi.useGetUserFavBookQuery(bookId)
    const [triggerAddFav] = mainApi.useSaveUserFavBookMutation()
    const [triggerRemoveFav] = mainApi.useRemoveUserFavBookMutation()

    const isFav = useMemo(() => isFavMap[bookId] ?? (favBookQuery.data?.success && favBookQuery.data.isFav), [bookId, isFavMap, favBookQuery.data])

    const toggleFav = () => {
        if (isFav) {
            dispatch(bookFavsSlice.actions.remove(bookId))
            triggerRemoveFav(bookId)
                .then((result) => {
                    if (!result.data?.success && result.data?.errorMessage) {
                        toastError(JSON.stringify(result.data.errorMessage))
                    }
                })
                .catch((error) => toastError(JSON.stringify(error)))
        } else {
            dispatch(bookFavsSlice.actions.add(bookId))
            triggerAddFav(bookId)
                .then((result) => {
                    if (!result.data?.success && result.data?.errorMessage) {
                        toastError(JSON.stringify(result.data.errorMessage))
                    }
                })
                .catch((error) => toastError(JSON.stringify(error)))
        }
    }

    return (
        <Button
            variant="link"
            size="icon"
            disabled={favBookQuery.isLoading && isFav === undefined}
            onClick={toggleFav}
        >
            <HeartIcon
                size={size}
                fill={isFav ? "red" : "white"}
                color="black"
                className={`${favBookQuery.isLoading && isFav === undefined && "animate-pulse"}`}
            ></HeartIcon>
        </Button>
    )
}

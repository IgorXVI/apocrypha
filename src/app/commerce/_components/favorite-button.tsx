"use client"

import { HeartIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { toastError } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { mainApi } from "~/lib/redux/apis/main-api/main"

export default function FavoriteButton({ bookId, size }: { bookId: string; size: number }) {
    const [triggerAddFav] = mainApi.useSaveUserFavBookMutation()
    const [triggerRemoveFav] = mainApi.useRemoveUserFavBookMutation()
    const isFavQuery = mainApi.useGetUserFavBookQuery(bookId)

    const [mutationLoading, setMutationLoading] = useState(false)
    const [mutationError, setMutationError] = useState(false)

    const isLoading = useMemo(() => mutationLoading || isFavQuery.isLoading, [isFavQuery.isLoading, mutationLoading])
    const isFav = useMemo(() => Boolean(isFavQuery.data?.success && isFavQuery.data.isFav), [isFavQuery.data])

    if (isFavQuery.isError || mutationError) {
        if (isFavQuery.error) {
            toastError(JSON.stringify(isFavQuery.error))
        }
        return (
            <Button
                variant="link"
                size="icon"
                disabled={true}
            >
                <XIcon
                    size={size}
                    className="text-red-500"
                ></XIcon>
            </Button>
        )
    }

    const toggleFav = () => {
        setMutationLoading(true)
        const p = isFav ? triggerRemoveFav(bookId) : triggerAddFav(bookId)
        p.then(() => isFavQuery.refetch().then(() => setMutationLoading(false))).catch((error) => {
            setMutationError(true)
            if (error instanceof Error) {
                toastError(error.message)
                return
            }
            toastError(JSON.stringify(error))
        })
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

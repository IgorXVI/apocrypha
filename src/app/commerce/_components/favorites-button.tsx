"use client"

import { HeartIcon } from "lucide-react"
import Link from "next/link"
import { useAppSelector } from "~/lib/redux/hooks"

export default function FavoritesButton() {
    const favs = useAppSelector((state) => state.bookFavs.value)

    return (
        <div className="rounded-sm relative">
            <Link href="/commerce/user/wish-list">
                <HeartIcon
                    color="red"
                    fill="red"
                    className="h-7 w-7"
                ></HeartIcon>
            </Link>

            <span className=" text-white absolute -top-1 left-5 text-center w-5 h-5 text-sm bg-slate-600 rounded-full">{favs.length}</span>
        </div>
    )
}

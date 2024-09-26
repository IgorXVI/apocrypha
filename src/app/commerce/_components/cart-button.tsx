"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { useAppSelector } from "~/lib/redux/hooks"

export default function CartButton() {
    const cartContent = useAppSelector((state) => state.bookCart.value)

    const cartCount = useMemo(() => cartContent.reduce((acc, curr) => acc + curr.amount, 0), [cartContent])

    return (
        <div className="rounded-sm relative">
            <Link href="/commerce/cart">
                <ShoppingCart className="h-7 w-7"></ShoppingCart>
            </Link>

            <span className=" text-white absolute -top-1 left-5 text-center w-5 h-5 text-sm bg-slate-600 rounded-full">{cartCount}</span>
        </div>
    )
}

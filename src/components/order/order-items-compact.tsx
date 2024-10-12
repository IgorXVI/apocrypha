"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface Product {
    id: string
    name: string
    image: string
}

interface OrderProductListProps {
    products?: Product[]
    maxDisplay?: number
}

export default function OrderItemsCompact({ products = [], maxDisplay = 3 }: OrderProductListProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!Array.isArray(products)) {
        console.error("Expected 'products' to be an array, but got:", products)
        return null
    }

    const displayProducts = isExpanded ? products : products.slice(0, maxDisplay)
    const remainingCount = Math.max(0, products.length - maxDisplay)

    return (
        <div className="flex items-center gap-2">
            {displayProducts.map((product) => (
                <Link
                    key={product.id}
                    href={`/commerce/book/${product.id}`}
                >
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="min-h-[50px] max-h-[50px] min-w-[50px] max-w-[50px] rounded-md object-cover"
                    />
                    <span className="sr-only">{product.name}</span>
                </Link>
            ))}
            {!isExpanded && remainingCount > 0 && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={`Show ${remainingCount} more product${remainingCount === 1 ? "" : "s"}`}
                >
                    +{remainingCount}
                </button>
            )}
            {isExpanded && products.length > maxDisplay && (
                <button
                    onClick={() => setIsExpanded(false)}
                    className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                >
                    Show less
                </button>
            )}
        </div>
    )
}

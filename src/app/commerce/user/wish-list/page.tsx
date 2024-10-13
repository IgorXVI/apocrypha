"use client"

import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { toast } from "sonner"

// Mock data for the user's wish-list
const initialWishList = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        cover: "/placeholder.svg?height=200&width=150",
        price: 12.99,
        inStock: true,
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        cover: "/placeholder.svg?height=200&width=150",
        price: 14.99,
        inStock: true,
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        cover: "/placeholder.svg?height=200&width=150",
        price: 11.99,
        inStock: false,
    },
    {
        id: 4,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        cover: "/placeholder.svg?height=200&width=150",
        price: 9.99,
        inStock: true,
    },
]

export default function WishListPage() {
    const [wishList, setWishList] = useState(initialWishList)

    const removeFromWishList = (id: number) => {
        setWishList(wishList.filter((book) => book.id !== id))
        toast("The book has been removed from your wish list.")
    }

    const addToCart = (id: number) => {
        // In a real application, this would add the item to the cart
        toast("The book has been added to your cart.")
    }

    const totalValue = wishList.reduce((sum, book) => sum + book.price, 0)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Your Wish List</h1>
                <Badge
                    variant="secondary"
                    className="text-lg py-1 px-3"
                >
                    {wishList.length} {wishList.length === 1 ? "item" : "items"}
                </Badge>
            </div>

            {wishList.length > 0 ? (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        {wishList.map((book) => (
                            <Card
                                key={book.id}
                                className="flex flex-col"
                            >
                                <CardHeader>
                                    <div className="relative w-full h-48 mb-4">
                                        <Image
                                            src={book.cover}
                                            alt={book.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <CardTitle>{book.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground">{book.author}</p>
                                    <p className="font-semibold mt-2">${book.price.toFixed(2)}</p>
                                    {!book.inStock && (
                                        <Badge
                                            variant="destructive"
                                            className="mt-2"
                                        >
                                            Out of Stock
                                        </Badge>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeFromWishList(book.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove from wish list</span>
                                    </Button>
                                    <Button
                                        onClick={() => addToCart(book.id)}
                                        disabled={!book.inStock}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <Separator className="my-8" />

                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-lg">
                                Total Value: <span className="font-bold">${totalValue.toFixed(2)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {wishList.filter((book) => book.inStock).length} out of {wishList.length} items in stock
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full md:w-auto"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add All to Cart
                        </Button>
                    </div>
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center py-8">
                        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Your Wish List is Empty</h2>
                        <p className="text-muted-foreground mb-4">Start adding books you love to your wish list!</p>
                        <Button>Browse Books</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

import { Calendar, Star } from "lucide-react"
import Image from "next/image"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"

// Mock data for the author and their books
const author = {
    name: "Jane Austen",
    bio: "Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century. Austen's plots often explore the dependence of women on marriage in the pursuit of favorable social standing and economic security.",
    birthYear: 1775,
    deathYear: 1817,
    imageUrl: "/placeholder.svg?height=400&width=300",
    books: [
        {
            id: 1,
            title: "Pride and Prejudice",
            year: 1813,
            cover: "/placeholder.svg?height=300&width=200",
            price: 12.99,
            rating: 4.7,
            inStock: true,
        },
        {
            id: 2,
            title: "Sense and Sensibility",
            year: 1811,
            cover: "/placeholder.svg?height=300&width=200",
            price: 11.99,
            rating: 4.5,
            inStock: true,
        },
        {
            id: 3,
            title: "Emma",
            year: 1815,
            cover: "/placeholder.svg?height=300&width=200",
            price: 13.99,
            rating: 4.6,
            inStock: false,
        },
    ],
}

export default function AuthorDetailsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <Image
                    src={author.imageUrl}
                    alt={author.name}
                    width={300}
                    height={400}
                    className="rounded-lg shadow-lg"
                />
                <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-4">{author.name}</h1>
                    <p className="text-lg mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {author.birthYear} - {author.deathYear}
                    </p>
                    <p className="text-lg mb-6">{author.bio}</p>
                    <Separator className="my-6" />
                    <h2 className="text-2xl font-semibold mb-4">Books by {author.name}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {author.books.map((book) => (
                            <Card
                                key={book.id}
                                className="flex flex-col"
                            >
                                <CardHeader>
                                    <Image
                                        src={book.cover}
                                        alt={book.title}
                                        width={200}
                                        height={300}
                                        className="rounded-lg shadow-md mx-auto"
                                    />
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <CardTitle className="mb-2">{book.title}</CardTitle>
                                    <p className="text-muted-foreground mb-2">Published: {book.year}</p>
                                    <div className="flex items-center gap-1 mb-2">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{book.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="font-semibold">${book.price.toFixed(2)}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        disabled={!book.inStock}
                                    >
                                        {book.inStock ? "Add to Cart" : "Out of Stock"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

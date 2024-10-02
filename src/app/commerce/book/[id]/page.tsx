"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function BookDetails() {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // This would typically come from a database or API
    const book = {
        title: "The Great Gatsby",
        subtitle: "A Portrait of the Jazz Age",
        authors: ["F. Scott Fitzgerald"],
        translators: ["Đỗ Hồng Ngọc", "Trịnh Lữ"],
        description:
            "Set in the summer of 1922, The Great Gatsby follows the lives of a group of characters living in the fictional town of West Egg on prosperous Long Island. The story primarily concerns the young and mysterious millionaire Jay Gatsby and his quixotic passion and obsession with the beautiful former debutante Daisy Buchanan.",
        price: 14.99,
        images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
        relatedBooks: [
            { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", cover: "/placeholder.svg" },
            { id: 2, title: "1984", author: "George Orwell", cover: "/placeholder.svg" },
            { id: 3, title: "Pride and Prejudice", author: "Jane Austen", cover: "/placeholder.svg" },
        ],
        reviews: [
            {
                id: 1,
                author: "John Doe",
                rating: 5,
                content:
                    "A classic that never gets old. Fitzgerald's prose is as beautiful as ever, painting a vivid picture of the Roaring Twenties.",
            },
            {
                id: 2,
                author: "Jane Smith",
                rating: 4,
                content:
                    "Beautifully written, captures the essence of the era. The characters are complex and the story is both tragic and compelling.",
            },
        ],
        authorInfo: {
            name: "F. Scott Fitzgerald",
            bio: "Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer. He is best known for his novels depicting the flamboyance and excess of the Jazz Age.",
            image: "/placeholder.svg",
        },
        series: {
            name: "The Great American Novel Collection",
            books: ["The Great Gatsby", "The Sun Also Rises", "The Grapes of Wrath"],
        },
        attributes: {
            isbn10: "0743273567",
            isbn13: "978-0743273565",
            language: "English",
            publisher: "Scribner",
            category: "Fiction",
            subcategory: "Classics",
        },
    }

    const scrollToImage = (index: number) => {
        if (scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current
            const targetImage = scrollContainer.children[index] as HTMLElement
            if (targetImage) {
                const scrollLeft = targetImage.offsetLeft - scrollContainer.offsetWidth / 2 + targetImage.offsetWidth / 2
                scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" })
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Enter" || e.key === " ") {
            setSelectedImageIndex(index)
            scrollToImage(index)
        }
    }

    useEffect(() => {
        scrollToImage(selectedImageIndex)
    }, [selectedImageIndex])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold">{book.title}</h1>
                    <h2 className="text-xl text-muted-foreground mt-2">{book.subtitle}</h2>

                    <div className="flex items-center mt-4 space-x-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(Based on {book.reviews.length} reviews)</span>
                    </div>

                    <div className="mt-6">
                        <div className="mb-4 relative">
                            <Image
                                src={book.images[selectedImageIndex]}
                                alt={`${book.title} - Selected Image`}
                                width={600}
                                height={400}
                                className="rounded-md object-cover mx-auto"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : book.images.length - 1))}
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => setSelectedImageIndex((prev) => (prev < book.images.length - 1 ? prev + 1 : 0))}
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative">
                            <div
                                ref={scrollContainerRef}
                                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                            >
                                {book.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`shrink-0 cursor-pointer transition-all duration-200 ${
                                            index === selectedImageIndex ? "ring-2 ring-primary ring-offset-2" : ""
                                        }`}
                                        onClick={() => setSelectedImageIndex(index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Select image ${index + 1}`}
                                        aria-selected={index === selectedImageIndex}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${book.title} - Image ${index + 1}`}
                                            width={100}
                                            height={150}
                                            className="rounded-md object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold">Authors</h3>
                        <ul className="mt-2 space-y-1">
                            {book.authors.map((author, index) => (
                                <li key={index}>{author}</li>
                            ))}
                        </ul>
                    </div>

                    {book.translators.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Translators</h3>
                            <ul className="mt-2 space-y-1">
                                {book.translators.map((translator, index) => (
                                    <li key={index}>{translator}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground">{book.description}</p>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                        <div className="flex items-start space-x-4">
                            <Image
                                src={book.authorInfo.image}
                                alt={book.authorInfo.name}
                                width={100}
                                height={100}
                                className="rounded-full object-cover"
                            />
                            <div>
                                <h4 className="font-medium">{book.authorInfo.name}</h4>
                                <p className="text-sm text-muted-foreground mt-2">{book.authorInfo.bio}</p>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Book Series</h3>
                        <p className="font-medium">{book.series.name}</p>
                        <ul className="mt-2 space-y-1">
                            {book.series.books.map((seriesBook, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-muted-foreground"
                                >
                                    {seriesBook}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Book Details</h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <dt className="font-medium">ISBN-10</dt>
                            <dd className="text-muted-foreground">{book.attributes.isbn10}</dd>
                            <dt className="font-medium">ISBN-13</dt>
                            <dd className="text-muted-foreground">{book.attributes.isbn13}</dd>
                            <dt className="font-medium">Language</dt>
                            <dd className="text-muted-foreground">{book.attributes.language}</dd>
                            <dt className="font-medium">Publisher</dt>
                            <dd className="text-muted-foreground">{book.attributes.publisher}</dd>
                            <dt className="font-medium">Category</dt>
                            <dd className="text-muted-foreground">{book.attributes.category}</dd>
                            <dt className="font-medium">Subcategory</dt>
                            <dd className="text-muted-foreground">{book.attributes.subcategory}</dd>
                        </dl>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                        {book.reviews.map((review) => (
                            <Card
                                key={review.id}
                                className="mb-4"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{review.author[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium">{review.author}</p>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-3xl font-bold mb-4">${book.price.toFixed(2)}</div>
                            <Button className="w-full mb-4">Add to Cart</Button>
                            <Button
                                variant="outline"
                                className="w-full"
                            >
                                Add to Wishlist
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Related Books</h3>
                        <ul className="space-y-4">
                            {book.relatedBooks.map((relatedBook) => (
                                <li key={relatedBook.id}>
                                    <Link
                                        href={`/books/${relatedBook.id}`}
                                        className="flex items-center space-x-4 p-2 hover:bg-muted rounded-md transition-colors"
                                    >
                                        <Image
                                            src={relatedBook.cover}
                                            alt={`Cover of ${relatedBook.title}`}
                                            width={60}
                                            height={90}
                                            className="rounded-md object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-medium">{relatedBook.title}</p>
                                            <p className="text-sm text-muted-foreground">{relatedBook.author}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

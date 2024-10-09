"use client"

import { CalendarIcon, Edit2Icon, Star, Trash2Icon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { toast } from "sonner"

// Mock data for the user's reviews
const initialReviews = [
    {
        id: 1,
        bookTitle: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        cover: "/placeholder.svg?height=200&width=150",
        rating: 5,
        reviewTitle: "A Timeless Classic",
        reviewContent:
            "This book perfectly captures the essence of the Roaring Twenties. Fitzgerald's prose is beautiful and the story is both entertaining and thought-provoking.",
        date: "2023-05-15",
    },
    {
        id: 2,
        bookTitle: "To Kill a Mockingbird",
        author: "Harper Lee",
        cover: "/placeholder.svg?height=200&width=150",
        rating: 4,
        reviewTitle: "Powerful and Moving",
        reviewContent:
            "A poignant exploration of racial injustice and loss of innocence. Lee's characters are unforgettable, especially Atticus Finch.",
        date: "2023-06-02",
    },
    {
        id: 3,
        bookTitle: "1984",
        author: "George Orwell",
        cover: "/placeholder.svg?height=200&width=150",
        rating: 5,
        reviewTitle: "Chillingly Relevant",
        reviewContent:
            "Orwell's dystopian vision feels more relevant than ever. A must-read for anyone concerned about privacy and government overreach.",
        date: "2023-06-20",
    },
]

export default function UserReviewsPage() {
    const [reviews, setReviews] = useState(initialReviews)
    const [sortOrder, setSortOrder] = useState("newest")

    const sortReviews = (order: string) => {
        const sorted = [...reviews].sort((a, b) => {
            if (order === "newest") {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            } else if (order === "oldest") {
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            } else if (order === "highest") {
                return b.rating - a.rating
            } else {
                return a.rating - b.rating
            }
        })
        setReviews(sorted)
    }

    const handleSort = (value: string) => {
        setSortOrder(value)
        sortReviews(value)
    }

    const deleteReview = (id: number) => {
        setReviews(reviews.filter((review) => review.id !== id))
        toast("Your review has been successfully deleted.")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-4xl font-bold mb-4 md:mb-0">Your Book Reviews</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <Select
                        onValueChange={handleSort}
                        defaultValue={sortOrder}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="highest">Highest Rated</SelectItem>
                            <SelectItem value="lowest">Lowest Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                    <Card
                        key={review.id}
                        className="flex flex-col"
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <Image
                                        src={review.cover}
                                        alt={review.bookTitle}
                                        width={80}
                                        height={120}
                                        className="rounded-md shadow"
                                    />
                                    <div>
                                        <CardTitle className="text-xl mb-1">{review.bookTitle}</CardTitle>
                                        <p className="text-sm text-muted-foreground mb-2">by {review.author}</p>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <h3 className="font-semibold mb-2">{review.reviewTitle}</h3>
                            <p className="text-sm text-muted-foreground">{review.reviewContent}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(review.date).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                >
                                    <Edit2Icon className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Are you sure you want to delete this review?</DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone. This will permanently delete your review for {review.bookTitle}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline">Cancel</Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => deleteReview(review.id)}
                                            >
                                                Delete
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {reviews.length === 0 && (
                <Card className="mt-8">
                    <CardContent className="flex flex-col items-center py-8">
                        <h2 className="text-2xl font-semibold mb-2">No Reviews Yet</h2>
                        <p className="text-muted-foreground mb-4">You havent written any book reviews yet.</p>
                        <Button>Start Reviewing</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

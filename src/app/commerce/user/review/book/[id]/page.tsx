"use client"

import { Star } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "sonner"

// Mock data for the book being reviewed
const book = {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "/placeholder.svg?height=300&width=200",
    publishYear: 1925,
}

export default function BookReviewPage() {
    const [rating, setRating] = useState<string>("")
    const [title, setTitle] = useState("")
    const [review, setReview] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!rating) {
            toast("Please select a rating.")
            return
        }

        if (!title.trim()) {
            toast("Please enter a review title.")
            return
        }

        if (!review.trim()) {
            toast("Please enter your review.")
            return
        }

        // In a real application, you would send this data to your server
        console.log({ rating, title, review })
        toast("Thank you for your review!")

        // Reset form
        setRating("")
        setTitle("")
        setReview("")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Write a Review</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Book Details</CardTitle>
                        <CardDescription>You are reviewing this book</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-4">
                        <Image
                            src={book.cover}
                            alt={book.title}
                            width={200}
                            height={300}
                            className="rounded-lg shadow-md"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">{book.title}</h2>
                            <p className="text-muted-foreground mb-2">by {book.author}</p>
                            <p className="text-sm text-muted-foreground">Published in {book.publishYear}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Review</CardTitle>
                        <CardDescription>Share your thoughts about the book</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label>Rating</Label>
                                <RadioGroup
                                    value={rating}
                                    onValueChange={setRating}
                                    className="flex space-x-2"
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <Label
                                            key={value}
                                            className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${
                                                rating === value.toString() ? "bg-primary text-primary-foreground" : ""
                                            }`}
                                        >
                                            <RadioGroupItem
                                                value={value.toString()}
                                                id={`rating-${value}`}
                                                className="sr-only"
                                            />
                                            <Star className={`h-4 w-4 ${rating === value.toString() ? "fill-primary-foreground" : "fill-muted"}`} />
                                            <span>{value}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Review Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Summarize your review"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="review">Your Review</Label>
                                <Textarea
                                    id="review"
                                    placeholder="Write your review here"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    required
                                    rows={5}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                            >
                                Submit Review
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

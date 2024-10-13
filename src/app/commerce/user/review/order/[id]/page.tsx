"use client"

import { Star } from "lucide-react"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "sonner"

// Mock data for the recent purchase
const recentPurchase = {
    orderId: "ORD-12345",
    date: "2023-07-15",
    items: [
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
        { title: "To Kill a Mockingbird", author: "Harper Lee" },
    ],
    total: 29.98,
}

export default function BuyingExperienceReviewPage() {
    const [overallRating, setOverallRating] = useState<string>("")
    const [deliveryRating, setDeliveryRating] = useState<string>("")
    const [customerServiceRating, setCustomerServiceRating] = useState<string>("")
    const [title, setTitle] = useState("")
    const [review, setReview] = useState("")
    const [wouldRecommend, setWouldRecommend] = useState<string>("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!overallRating || !deliveryRating || !customerServiceRating || !wouldRecommend) {
            toast("Please fill in all rating fields.")
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
        console.log({ overallRating, deliveryRating, customerServiceRating, title, review, wouldRecommend })
        toast("Thank you for your feedback!")

        // Reset form
        setOverallRating("")
        setDeliveryRating("")
        setCustomerServiceRating("")
        setTitle("")
        setReview("")
        setWouldRecommend("")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Review Your Buying Experience</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Purchase</CardTitle>
                        <CardDescription>Order details for your review</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Order ID:</span>
                            <span>{recentPurchase.orderId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Date:</span>
                            <span>{recentPurchase.date}</span>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-2">Items:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {recentPurchase.items.map((item, index) => (
                                    <li key={index}>
                                        {item.title} by {item.author}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Total:</span>
                            <span>${recentPurchase.total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Review</CardTitle>
                        <CardDescription>Share your thoughts about your buying experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Overall Experience</Label>
                                    <StarRating
                                        rating={overallRating}
                                        setRating={setOverallRating}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Delivery Experience</Label>
                                    <StarRating
                                        rating={deliveryRating}
                                        setRating={setDeliveryRating}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Customer Service</Label>
                                    <StarRating
                                        rating={customerServiceRating}
                                        setRating={setCustomerServiceRating}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Review Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Summarize your experience"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="review">Your Review</Label>
                                <Textarea
                                    id="review"
                                    placeholder="Tell us about your buying experience"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    required
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Would you recommend Apocrypha to a friend?</Label>
                                <RadioGroup
                                    value={wouldRecommend}
                                    onValueChange={setWouldRecommend}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="yes"
                                            id="recommend-yes"
                                        />
                                        <Label htmlFor="recommend-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="no"
                                            id="recommend-no"
                                        />
                                        <Label htmlFor="recommend-no">No</Label>
                                    </div>
                                </RadioGroup>
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

interface StarRatingProps {
    rating: string
    setRating: (rating: string) => void
}

function StarRating({ rating, setRating }: StarRatingProps) {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value.toString())}
                    className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                    <Star className={`h-6 w-6 ${parseInt(rating) >= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                </button>
            ))}
        </div>
    )
}

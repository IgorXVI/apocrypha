"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"
import { Button } from "~/components/ui/button"
import BookCard from "./book-card"

type Book = {
    id: string
    stripeId: string
    author: string
    authorId: string
    title: string
    description: string
    price: number
    mainImg: string
}

export default function HorizontalList({ title, books }: { title: string; books: Book[] }) {
    const [scrollPosition, setScrollPosition] = useState(0)
    const sliderRef = useRef<HTMLDivElement>(null)

    const handleScroll = (direction: "left" | "right") => {
        if (sliderRef.current) {
            const scrollAmount = 300
            const newPosition =
                direction === "left"
                    ? Math.max(0, scrollPosition - scrollAmount)
                    : Math.min(sliderRef.current.scrollWidth - sliderRef.current.clientWidth, scrollPosition + scrollAmount)
            sliderRef.current.scrollTo({ left: newPosition, behavior: "smooth" })
            setScrollPosition(newPosition)
        }
    }

    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
            <div className="relative">
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
                >
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            {...book}
                        />
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10 bg-background"
                    onClick={() => handleScroll("left")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10 bg-background"
                    onClick={() => handleScroll("right")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </section>
    )
}

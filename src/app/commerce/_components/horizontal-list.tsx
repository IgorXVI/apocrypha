"use client"

import "react-alice-carousel/lib/alice-carousel.css"

import Image from "next/image"
import Link from "next/link"
import AliceCarousel from "react-alice-carousel"
import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    return (
        <section className="mb-10">
            <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
            <AliceCarousel
                disableButtonsControls
                controlsStrategy="responsive"
                autoPlay
                autoPlayInterval={3000}
                animationDuration={1000}
                infinite
                responsive={{
                    0: {
                        items: 1,
                    },
                    768: {
                        items: 2,
                    },
                    1024: {
                        items: 4,
                    },
                }}
                items={books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/commerce/book/${book.id}`}
                        className="grid place-items-center cursor-default"
                    >
                        <Image
                            className="cursor-pointer"
                            src={book.mainImg}
                            alt={book.title}
                            width={300}
                            height={300}
                        ></Image>
                    </Link>
                ))}
                renderPrevButton={({ isDisabled }) =>
                    !isDisabled &&
                    books.length > 1 && (
                        <Button variant="ghost">
                            <ChevronLeft></ChevronLeft>
                        </Button>
                    )
                }
                renderNextButton={({ isDisabled }) =>
                    !isDisabled &&
                    books.length > 1 && (
                        <Button variant="ghost">
                            <ChevronRight></ChevronRight>
                        </Button>
                    )
                }
            ></AliceCarousel>
        </section>
    )
}

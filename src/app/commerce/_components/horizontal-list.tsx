"use client"

import Image from "next/image"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel"

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
            <Carousel
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {books.map((book) => (
                        <CarouselItem
                            key={book.id}
                            className="md:basis-1/2 lg:basis-1/3 pl-2 md:pl-4"
                        >
                            <Link
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
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselNext className="hidden md:flex"></CarouselNext>
                <CarouselPrevious className="hidden md:flex"></CarouselPrevious>
            </Carousel>
        </section>
    )
}

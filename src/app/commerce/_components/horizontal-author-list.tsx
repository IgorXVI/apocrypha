"use client"

import Image from "next/image"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel"

export default function HorizontalAuthorList({
    title,
    authors,
}: {
    title: string
    authors: {
        id: string
        img: string
        name: string
    }[]
}) {
    return (
        <section className="mb-10">
            <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
            <Carousel
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {authors.map((author) => (
                        <CarouselItem
                            key={author.id}
                            className="pl-2 md:pl-4 max-w-[300px]"
                        >
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Link
                                    href={`/commerce/author/${author.id}`}
                                    className="flex items-center justify-center"
                                >
                                    <Image
                                        src={author.img}
                                        alt="perfil do autor"
                                        className="rounded-full object-cover aspect-square border border-black"
                                        height={500}
                                        width={500}
                                    ></Image>
                                </Link>
                                <Link
                                    href={`/commerce/author/${author.id}`}
                                    className="hover:underline"
                                >
                                    {author.name}
                                </Link>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselNext className="hidden md:flex"></CarouselNext>
                <CarouselPrevious className="hidden md:flex"></CarouselPrevious>
            </Carousel>
        </section>
    )
}

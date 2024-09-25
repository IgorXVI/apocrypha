import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel"
import { db } from "~/server/db"

export default async function HomePage() {
    const books = await db.book.findMany({
        include: {
            DisplayImage: {
                select: {
                    id: true,
                    url: true,
                },
                orderBy: {
                    order: "asc",
                },
            },
            AuthorOnBook: {
                orderBy: {
                    main: "asc",
                },
                include: {
                    Author: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            Currency: {
                select: {
                    label: true,
                },
            },
        },
    })

    return (
        <main className="flex gap-5 flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Livros</h1>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-5 items-center justify-center">
                {books.map((book) => (
                    <Card
                        key={book.id}
                        className="flex flex-col justify-center max-w-sm"
                    >
                        <CardHeader>
                            <CardTitle>
                                <Link
                                    className="hover:underline hover:text-blue-700"
                                    href={`/book/${book.id}`}
                                >
                                    {book.title}
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                {book.AuthorOnBook.map((author, index) => (
                                    <span key={author.authorId}>
                                        <Link
                                            className="hover:underline hover:text-blue-700"
                                            href={`/author/${author.authorId}`}
                                        >
                                            {author.Author.name}
                                        </Link>
                                        {index < book.AuthorOnBook.length - 1 && <span>, </span>}
                                    </span>
                                ))}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex self-center items-center justify-center">
                            <div className="flex flex-col items-center justify-center hover:z-50 hover:bg-slate-500 hover:bg-opacity-5 hover:scale-110 duration-300">
                                <Carousel
                                    opts={{ loop: true }}
                                    className="flex flex-row w-[80%] h-full items-center justify-center"
                                >
                                    <CarouselContent className="flex items-center h-full">
                                        {book.DisplayImage.map((image) => (
                                            <CarouselItem
                                                key={image.id}
                                                className="flex flex-col items-center justify-center h-full w-full"
                                            >
                                                <Link href={`/book/${book.id}`}>
                                                    <Image
                                                        src={image.url}
                                                        alt={book.title}
                                                        width={500}
                                                        height={500}
                                                        className="object-contain aspect-square"
                                                    ></Image>
                                                </Link>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </CardContent>
                        <CardFooter className="text-xl font-extrabold">
                            {book.Currency.label} {book.price.toString()}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    )
}

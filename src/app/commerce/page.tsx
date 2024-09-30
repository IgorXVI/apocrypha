import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { db } from "~/server/db"

export default async function MainCommercePage() {
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
                take: 1,
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
        },
    })

    return (
        <main className="flex gap-5 flex-col items-center justify-center mb-5">
            <h1 className="text-4xl font-bold">Livros</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => (
                    <Card
                        key={book.id}
                        className="grid grid-rows-15 grid-cols-1 mx-3 md:mx-0 bg-black bg-opacity-30 text-neutral-200 border-none"
                    >
                        <CardHeader className="row-span-3">
                            <CardTitle>
                                <Link
                                    className="hover:underline hover:text-white"
                                    href={`/commerce/book/${book.id}`}
                                >
                                    {book.title.split(":")[0]}
                                    {book.title.includes(":") && ":"}
                                    <br />
                                    <span className="text-sm">{book.title.split(":")[1]}</span>
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                {book.AuthorOnBook.map((author, index) => (
                                    <span
                                        key={author.authorId}
                                        className="text-neutral-200"
                                    >
                                        <Link
                                            className="hover:underline hover:text-white"
                                            href={`/author/${author.authorId}`}
                                        >
                                            {author.Author.name}
                                        </Link>
                                        {index < book.AuthorOnBook.length - 1 && <span>, </span>}
                                    </span>
                                ))}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="row-span-11 grid place-items-center">
                            <Link href={`/commerce/book/${book.id}`}>
                                <Image
                                    src={book.DisplayImage[0]?.url ?? ""}
                                    alt={book.title}
                                    width={250}
                                    height={250}
                                    className="object-contain hover:scale-110 duration-300"
                                ></Image>
                            </Link>
                        </CardContent>
                        <CardFooter className="flex items-center">
                            <span className="text-xl font-bold text-green-500 bg-black p-2 rounded-md">R$ {book.price.toFixed(2)}</span>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    )
}

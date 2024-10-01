import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { db } from "~/server/db"
import AddToCartButton from "./_components/add-to-cart-button"

function BookCard(props: {
    id: string
    stripeId: string
    author: string
    authorId: string
    title: string
    description: string
    price: number
    mainImg: string
    imgSize: number
}) {
    return (
        <Card className="w-full max-w-sm overflow-hidden">
            <div className="aspect-[3/4] relative">
                <Link
                    href={`/commerce/book/${props.id}`}
                    className="w-full h-full"
                >
                    <Image
                        src={props.mainImg}
                        alt={`Cover of ${props.title}`}
                        className="object-cover w-full h-full"
                        width={props.imgSize}
                        height={props.imgSize}
                    ></Image>
                </Link>
            </div>
            <CardHeader>
                <CardTitle>
                    <Link href={`/commerce/book/${props.id}`}>
                        <p className="hover:underline">
                            <span className="line-clamp-1 hover:line-clamp-none">
                                {props.title.split(":")[0]}
                                {props.title.includes(":") && ":"}
                            </span>
                            <span className="line-clamp-1 text-base font-normal hover:line-clamp-none">
                                {props.title.includes(":") ? props.title.split(":")[1] : <br />}
                            </span>
                        </p>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Link href={`/commerce/author/${props.authorId}`}>
                    <p className="text-sm text-muted-foreground hover:underline">{props.author}</p>
                </Link>
                <p className="mt-2 text-2xl font-bold">R$ {props.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
                <AddToCartButton
                    {...props}
                    amount={1}
                ></AddToCartButton>
            </CardFooter>
        </Card>
    )
}

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
                take: 1,
            },
        },
    })

    return (
        <main className="flex gap-5 flex-col items-center justify-center mb-5">
            <h1 className="text-4xl font-bold">Livros</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        description={book.description}
                        price={book.price.toNumber()}
                        mainImg={book.DisplayImage[0]?.url ?? ""}
                        author={book.AuthorOnBook[0]?.Author.name ?? ""}
                        authorId={book.AuthorOnBook[0]?.authorId ?? ""}
                        imgSize={250}
                        stripeId={book.stripeId}
                    />
                ))}
            </div>
        </main>
    )
}

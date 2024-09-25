import Image from "next/image"
import { db } from "~/server/db"
import AddToCartButton from "../../_components/add-to-cart-button"

export default async function BookPage({ params: { id } }: { params: { id: string } }) {
    const book = await db.book.findUnique({
        where: {
            id,
        },
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
                            about: true,
                            imgUrl: true,
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

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-4xl font-bold mb-4">Livro não encontrado</h1>
                <p className="text-xl text-gray-600">Desculpe, não conseguimos encontrar o livro que você está procurando.</p>
            </div>
        )
    }

    return (
        <div className="flex gap-4 p-4">
            <Image
                src={book?.DisplayImage[0]?.url ?? ""}
                alt={book?.title}
                width={500}
                height={500}
            />
            <div className="flex flex-col gap-4 items-center justify-center">
                <h1 className="text-2xl font-bold">{book.title}</h1>
                <h2 className="text-xl font-bold">{book.descriptionTitle}</h2>
                <p className="text-sm text-gray-600">{book.description}</p>
                <AddToCartButton
                    author={book.AuthorOnBook[0]?.Author?.name ?? ""}
                    title={book.title}
                    price={book.price.toNumber()}
                    currency={book.Currency.label}
                    id={book.id}
                    amount={1}
                    mainImg={book.DisplayImage[0]?.url ?? ""}
                />
            </div>
        </div>
    )
}

import Image from "next/image"
import sanitizeHtml from "sanitize-html"

import { Separator } from "~/components/ui/separator"
import { db } from "~/server/db"
import BookCard from "../../_components/book-card"

export default async function AuthorDetailsPage({ params: { id } }: { params: { id: string } }) {
    const author = await db.author.findUnique({
        where: {
            id,
        },
        include: {
            AuthorOnBook: {
                include: {
                    Book: {
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
                                    order: "asc",
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
                    },
                },
            },
        },
    })

    if (!author) {
        return <p>Autor não foi encontrado.</p>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-8 mb-12 items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">{author.name}</h1>
                {author.about !== "N/A" && (
                    <>
                        <div className="flex flex-row gap-5 items-center justify-center">
                            <Image
                                src={author.imgUrl}
                                alt={author.name}
                                width={250}
                                height={250}
                                className="rounded-lg shadow-lg max-h-[250px] max-w-[250px] min-h-[250px] min-w-[250px]"
                            />
                            <p
                                className="text-lg mb-6"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(author.about) }}
                            ></p>
                        </div>
                        <Separator className="my-6" />
                    </>
                )}
                <h2 className="text-2xl font-semibold mb-4">Livros escritos por {author.name}</h2>
                <div className="commerce-book-list">
                    {author.AuthorOnBook.map(({ Book }) => (
                        <BookCard
                            key={Book.id}
                            hideAuthor={true}
                            book={{
                                id: Book.id,
                                title: Book.title,
                                amount: 1,
                                author: author.name,
                                authorId: author.id,
                                mainImg: Book.DisplayImage[0]?.url ?? "",
                                stock: Book.stock,
                                stripeId: Book.stripeId,
                                prevPrice: Book.prevPrice.toNumber(),
                                price: Book.price.toNumber(),
                            }}
                        ></BookCard>
                    ))}
                </div>
            </div>
        </div>
    )
}

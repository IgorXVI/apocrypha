import Image from "next/image"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

import { db } from "~/server/db"
import ReviewForm from "../_components/review-form"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

export default async function BookReviewPage({ params: { id } }: { params: { id: string } }) {
    const user = auth()
    if (!user.userId) {
        return <p>Não autorizado</p>
    }

    const book = await db.book.findUnique({
        where: {
            id,
        },
        include: {
            DisplayImage: {
                orderBy: {
                    order: "asc",
                },
                take: 1,
            },
            AuthorOnBook: {
                orderBy: {
                    main: "asc",
                },
                take: 1,
                include: {
                    Author: true,
                },
            },
            Review: {
                where: {
                    userId: user.userId,
                },
                take: 1,
            },
        },
    })

    if (!book) {
        return <p>Livro não encontrado.</p>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Escreva uma avaliação</h1>

            <div className="flex flex-row flex-wrap justify-center gap-12">
                <Card className="px-8">
                    <CardHeader>
                        <CardTitle>Detalhes do livro</CardTitle>
                        <CardDescription>Você vai avaliar esse livro</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-12">
                        <Link href={`/commerce/book/${book.id}`}>
                            <Image
                                src={book.DisplayImage[0]?.url ?? ""}
                                alt={book.title}
                                width={200}
                                height={300}
                                className="rounded-lg shadow-md"
                            />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2 hover:underline">
                                <Link href={`/commerce/book/${book.id}`}>{book.title}</Link>
                            </h2>
                            <p className="text-muted-foreground mb-2">de {book.AuthorOnBook[0]?.Author.name ?? "N/A"}</p>
                            <p className="text-sm text-muted-foreground">
                                Publicado em {book.publicationDate.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sua avaliação</CardTitle>
                        <CardDescription>Escreva uma avaliação do livro {book.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReviewForm
                            bookId={book.id}
                            existingValues={book.Review[0]}
                        ></ReviewForm>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

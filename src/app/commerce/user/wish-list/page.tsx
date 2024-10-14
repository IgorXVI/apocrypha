import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { db } from "~/server/db"
import { auth } from "@clerk/nextjs/server"
import BookCard from "../../_components/book-card"
import { HeartIcon } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function WishListPage() {
    const user = auth()

    if (!user.userId) {
        return <p>Unauthorized</p>
    }

    const favs = await db.favorite.findMany({
        where: {
            userId: user.userId,
        },
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
            },
        },
    })

    return (
        <div className="container mx-auto px-4 py-8 mb-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Seus favoritos</h1>
                <Badge
                    variant="secondary"
                    className="text-lg py-1 px-3"
                >
                    {favs.length} {favs.length === 1 ? "livro" : "livros"}
                </Badge>
            </div>

            {favs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-5 mb-8">
                    {favs.map((fav) => (
                        <BookCard
                            key={fav.id}
                            book={{
                                id: fav.Book.id,
                                price: fav.Book.price.toNumber(),
                                stripeId: fav.Book.stripeId,
                                title: fav.Book.title,
                                author: fav.Book.AuthorOnBook[0]?.Author.name ?? "",
                                authorId: fav.Book.AuthorOnBook[0]?.authorId ?? "",
                                mainImg: fav.Book.DisplayImage[0]?.url ?? "",
                            }}
                        ></BookCard>
                    ))}
                </div>
            ) : (
                <div className="text-center min-h-[50vh] flex flex-col items-center justify-center">
                    <HeartIcon className="h-16 w-16 text-muted-foreground mb-4"></HeartIcon>
                    <p className="text-3xl mb-4">Sua lista de favoritos está vazia</p>
                    <Button asChild>
                        <Link href="/commerce/book">Explorar livros</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}

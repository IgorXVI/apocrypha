import Link from "next/link"
import { Star, ChevronRight } from "lucide-react"
import sanitizeHtml from "sanitize-html"

import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import Image from "next/image"
import BookDetailsImages from "../../_components/book-details-images"
import { db } from "~/server/db"
import AddToCartButton from "../../_components/add-to-cart-button"
import AddToFavoriteButton from "../../_components/add-to-favorite-button"
import { type BookClientSideState } from "~/lib/types"

const langsMap: Record<string, string> = {
    PORTUGUESE: "Português",
    ENGLISH: "Inglês",
    SPANISH: "Espanhol",
    FRENCH: "Francês",
    GERMAN: "Alemão",
    ITALIAN: "Italiano",
    TURKISH: "Turco",
    RUSSIAN: "Russo",
    ARABIC: "Árabe",
    PORTUGUESE_BRAZILIAN: "Português (Brasil)",
}

function BookPriceCard(book: BookClientSideState) {
    const priceDiff = book.price < book.prevPrice ? Math.ceil(100 * (1 - book.price / book.prevPrice)) : 0

    return (
        <Card className="border-none">
            <CardContent className="p-6">
                <div className="w-full mb-4 grid grid-cols-1 gap-7 place-items-center">
                    <div className="flex flex-col justify-center gap-5">
                        {priceDiff > 10 && (
                            <p className="text-2xl text-muted-foreground">
                                De: <span className="line-through">R$ {book.prevPrice.toFixed(2)}</span>
                            </p>
                        )}
                        <div className="text-5xl flex flex-row gap-5">
                            {priceDiff > 10 && <span className="text-red-500 font-normal text-nowrap">-{priceDiff}%</span>}
                            <span className="text-green-500 font-bold text-nowrap">R$ {book.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <AddToCartButton
                        bookForCart={book}
                        large={true}
                    ></AddToCartButton>
                </div>
            </CardContent>
        </Card>
    )
}

function RelatedBooks({ relatedBooks }: { relatedBooks: { id: string; title: string; author: string; cover: string }[] }) {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Livros relacionados</h3>
            <ul className="space-y-4">
                {relatedBooks.map((relatedBook) => (
                    <li key={relatedBook.id}>
                        <Link
                            href={`/commerce/book/${relatedBook.id}`}
                            className="flex items-center space-x-4 p-2 hover:bg-muted rounded-md transition-colors"
                        >
                            <Image
                                src={relatedBook.cover}
                                alt={`Cover of ${relatedBook.title}`}
                                width={60}
                                height={90}
                                className="rounded-md object-cover"
                            />
                            <div className="flex-grow">
                                <p className="font-medium">{relatedBook.title}</p>
                                <p className="text-sm text-muted-foreground">{relatedBook.author}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default async function BookDetails({ params: { id } }: { params: { id: string } }) {
    const reviews = [
        {
            id: "1",
            author: "John Doe",
            rating: 5,
            content: "A classic that never gets old. Fitzgerald's prose is as beautiful as ever, painting a vivid picture of the Roaring Twenties.",
        },
        {
            id: "2",
            author: "Jane Smith",
            rating: 4,
            content: "Beautifully written, captures the essence of the era. The characters are complex and the story is both tragic and compelling.",
        },
    ]

    const DBBook = await db.book.findUniqueOrThrow({
        where: {
            id,
        },
        include: {
            DisplayImage: {
                select: {
                    url: true,
                },
                orderBy: {
                    order: "asc",
                },
            },
            RelatedBook: {
                include: {
                    DisplayImage: {
                        select: {
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
                        take: 1,
                        include: {
                            Author: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
            RelatedBooks: {
                include: {
                    DisplayImage: {
                        select: {
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
                        take: 1,
                        include: {
                            Author: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
            AuthorOnBook: {
                orderBy: {
                    main: "asc",
                },
                include: {
                    Author: true,
                },
            },
            TranslatorOnBook: {
                orderBy: {
                    main: "asc",
                },
                include: {
                    Translator: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            Series: {
                include: {
                    Book: {
                        select: {
                            id: true,
                            title: true,
                            placeInSeries: true,
                        },
                        orderBy: {
                            placeInSeries: "asc",
                        },
                    },
                },
            },
            Publisher: {
                select: {
                    name: true,
                },
            },
            CategoryOnBook: {
                orderBy: {
                    main: "asc",
                },
                take: 1,
                include: {
                    Category: {
                        include: {
                            SuperCategory: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (DBBook.RelatedBook && !DBBook.RelatedBooks.some((relatedBook) => relatedBook.id === (DBBook.RelatedBook?.id ?? "N/A"))) {
        DBBook.RelatedBooks.unshift(DBBook.RelatedBook)
    }

    const book = {
        title: DBBook.title.split(":")[0] ?? "N/A",
        subtitle: DBBook.title.split(":")[1] ?? "",
        authors: DBBook.AuthorOnBook.map((author) => author.Author.name),
        authorInfo: {
            id: DBBook.AuthorOnBook[0]?.Author.id ?? "N/A",
            name: DBBook.AuthorOnBook[0]?.Author.name ?? "N/A",
            image: DBBook.AuthorOnBook[0]?.Author.imgUrl ?? "N/A",
            bio: DBBook.AuthorOnBook[0]?.Author.about ?? "N/A",
        },
        series: {
            name: DBBook.Series?.name ?? "",
            books: DBBook.Series?.Book ?? [],
        },
        translators: DBBook.TranslatorOnBook.map((translator) => translator.Translator.name),
        description: DBBook.description,
        price: DBBook.price.toNumber(),
        images: DBBook.DisplayImage.map((image) => image.url),
        relatedBooks: DBBook.RelatedBooks.map((relatedBook) => ({
            id: relatedBook.id,
            title: relatedBook.title,
            author: relatedBook.AuthorOnBook[0]?.Author.name ?? "N/A",
            cover: relatedBook.DisplayImage[0]?.url ?? "N/A",
        })),
        attributes: {
            isbn10: DBBook.isbn10Code,
            isbn13: DBBook.isbn13Code,
            language: DBBook.language,
            publisher: DBBook.Publisher.name,
            edition: DBBook.edition,
            category: DBBook.CategoryOnBook[0]?.Category.SuperCategory?.name ?? "N/A",
            subcategory: DBBook.CategoryOnBook[0]?.Category.name ?? "N/A",
        },
    }

    const bookForCart: BookClientSideState = {
        id: DBBook.id,
        title: DBBook.title,
        stripeId: DBBook.stripeId,
        amount: 1,
        mainImg: DBBook.DisplayImage[0]?.url ?? "",
        author: DBBook.AuthorOnBook[0]?.Author.name ?? "",
        price: DBBook.price.toNumber(),
        stock: DBBook.stock,
        authorId: DBBook.AuthorOnBook[0]?.authorId ?? "",
        prevPrice: DBBook.prevPrice.toNumber(),
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                    <div className="flex gap-5 items-center">
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="text-3xl font-bold">{book.title}</h1>
                            {book.subtitle.length > 0 && <h2 className="text-xl text-muted-foreground mt-2">{book.subtitle}</h2>}
                        </div>
                        <AddToFavoriteButton
                            book={bookForCart}
                            size={100}
                        ></AddToFavoriteButton>
                    </div>

                    <div className="flex items-center mt-4 space-x-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(Baseado em {reviews.length} avaliações)</span>
                    </div>

                    <div className="grid place-content-center">
                        <BookDetailsImages
                            images={book.images}
                            title={book.title}
                        />
                    </div>

                    <div className="md:hidden">
                        <BookPriceCard {...bookForCart} />
                        {book.relatedBooks.length > 0 && <RelatedBooks relatedBooks={book.relatedBooks} />}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold">{book.authors.length > 1 ? "Autores" : "Autor"}</h3>
                        <ul className="mt-2 space-y-1">
                            {book.authors.map((author, index) => (
                                <li key={index}>{author}</li>
                            ))}
                        </ul>
                    </div>

                    {book.translators.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">{book.translators.length > 1 ? "Tradutores" : "Tradutor"}</h3>
                            <ul className="mt-2 space-y-1">
                                {book.translators.map((translator, index) => (
                                    <li key={index}>{translator}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                        <div className="text-muted-foreground">
                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(book.description) }}></div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Sobre o Autor</h3>
                        <div className="flex flex-row gap-4">
                            <Link href={`/commerce/author/${book.authorInfo.id}`}>
                                <Image
                                    src={book.authorInfo.image}
                                    alt={book.authorInfo.name}
                                    width={75}
                                    height={75}
                                    className="rounded-lg shadow-lg min-w-[75px] max-w-[75px] min-h-[75px] max-h-[75px]"
                                ></Image>
                            </Link>
                            <div className="flex flex-col">
                                <h4 className="font-medium">
                                    <Link
                                        href={`/commerce/author/${book.authorInfo.id}`}
                                        className="hover:underline"
                                    >
                                        {book.authorInfo.name}
                                    </Link>
                                </h4>
                                <div className="text-sm text-muted-foreground mt-2">
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(book.authorInfo.bio) }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {book.series.name !== "" && (
                        <>
                            <Separator className="my-6" />
                            <div>
                                <h3 className="text-2xl font-extrabold">Série: {book.series.name}</h3>
                                <ul className="mt-2 space-y-1">
                                    {book.series.books.map((seriesBook, index) => (
                                        <li key={index}>
                                            {seriesBook.placeInSeries}º Livro -{" "}
                                            <Link
                                                href={`/commerce/book/${seriesBook.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {seriesBook.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Detalhes do livro</h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <dt className="font-medium">ISBN-10</dt>
                            <dd className="text-muted-foreground">{book.attributes.isbn10}</dd>
                            <dt className="font-medium">ISBN-13</dt>
                            <dd className="text-muted-foreground">{book.attributes.isbn13}</dd>
                            <dt className="font-medium">Idioma</dt>
                            <dd className="text-muted-foreground">{langsMap[book.attributes.language] ?? "N/A"}</dd>
                            <dt className="font-medium">Editora</dt>
                            <dd className="text-muted-foreground">{book.attributes.publisher}</dd>
                            <dt className="font-medium">Edição</dt>
                            <dd className="text-muted-foreground">{book.attributes.edition}ª</dd>
                            <dt className="font-medium">Categoria</dt>
                            <dd className="text-muted-foreground">{book.attributes.category}</dd>
                            <dt className="font-medium">Subcategoria</dt>
                            <dd className="text-muted-foreground">{book.attributes.subcategory}</dd>
                        </dl>
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Avaliações</h3>
                        {reviews.map((review) => (
                            <Card
                                key={review.id}
                                className="mb-4"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{review.author[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium">{review.author}</p>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="hidden md:flex flex-col col-span-2">
                    <BookPriceCard {...bookForCart} />
                    {book.relatedBooks.length > 0 && <RelatedBooks relatedBooks={book.relatedBooks} />}
                </div>
            </div>
        </div>
    )
}

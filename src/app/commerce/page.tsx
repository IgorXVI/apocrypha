import { db } from "~/server/db"

import Link from "next/link"

import { convertSvgToImgSrc } from "~/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import HorizontalList from "./_components/horizontal-list"
import HeroSection from "./_components/hero-section"
import { auth } from "@clerk/nextjs/server"
import { type BookClientSideState } from "~/lib/types"
import { type Prisma } from "prisma/prisma-client"
import HorizontalAuthorList from "./_components/horizontal-author-list"

function SuperCategoriesSection(props: {
    superCategories: {
        id: string
        name: string
        iconSvg?: string
        categories: {
            id: string
            name: string
        }[]
    }[]
}) {
    const { superCategories } = props

    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Compre por categoria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {superCategories.map((superCategory) => (
                    <Accordion
                        key={superCategory.id}
                        type="single"
                        collapsible
                        className="w-full"
                    >
                        <AccordionItem value={superCategory.name}>
                            <AccordionTrigger className="text-lg font-semibold">
                                <div className="flex flex-row items-center gap-2">
                                    {superCategory.iconSvg && (
                                        <img
                                            src={convertSvgToImgSrc(superCategory.iconSvg)}
                                            alt={superCategory.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="32"
                                            width="32"
                                        ></img>
                                    )}
                                    {superCategory.name}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2">
                                    <li key="all">
                                        <Link
                                            href={`/commerce/book?superCategoryId=${superCategory.id}&categoryId=all&sortBy=title`}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Todos
                                        </Link>
                                    </li>
                                    {superCategory.categories
                                        .filter((category) => category.name !== superCategory.name)
                                        .map((category) => (
                                            <li key={category.id}>
                                                <Link
                                                    href={`/commerce/book?superCategoryId=${superCategory.id}&categoryId=${category.id}&sortBy=title`}
                                                    className="text-sm text-muted-foreground hover:text-foreground"
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
            </div>
        </section>
    )
}

export default async function MainCommercePage() {
    const user = auth()
    if (!user.userId) {
        return <p>Unauthorized</p>
    }

    const booksInclude = {
        DisplayImage: {
            select: {
                id: true,
                url: true,
            },
            orderBy: {
                order: "asc" as Prisma.SortOrder,
            },
            take: 1,
        },
        AuthorOnBook: {
            orderBy: {
                order: "asc" as Prisma.SortOrder,
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
    }

    const [bestSellingBooks, newBooks, superCategories] = await Promise.all([
        db.book.findMany({
            include: booksInclude,
            orderBy: {
                BookOnOrder: {
                    _count: "desc",
                },
            },
            take: 10,
        }),
        db.book.findMany({
            where: {
                publicationDate: {
                    lte: new Date(),
                },
            },
            include: booksInclude,
            orderBy: {
                publicationDate: "desc",
            },
            take: 10,
        }),
        db.superCategory.findMany({
            include: {
                Category: {
                    select: {
                        id: true,
                        name: true,
                    },
                    orderBy: {
                        name: "asc",
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        }),
    ])

    const [bestSellingAuthors, authorsWithMostBooks] = await Promise.all([
        db.author.findMany({
            where: {
                id: {
                    in: bestSellingBooks.map((book) => book.AuthorOnBook[0]?.authorId ?? ""),
                },
            },
            orderBy: {
                AuthorOnBook: {
                    _count: "desc",
                },
            },
            take: 5,
        }),
        db.author.findMany({
            where: {
                id: {
                    not: "aa5fe3dc-c2e0-4da3-83c7-51c97acf99e2",
                },
            },
            orderBy: {
                AuthorOnBook: {
                    _count: "desc",
                },
            },
            take: 5,
        }),
    ])

    const authors = bestSellingAuthors.concat(authorsWithMostBooks)

    const formatBooks: (input: typeof newBooks) => BookClientSideState[] = (inputBooks) =>
        inputBooks.map((book) => ({
            id: book.id,
            title: book.title,
            mainImg: book.DisplayImage[0]?.url ?? "",
            author: book.AuthorOnBook[0]?.Author.name ?? "",
            price: book.price.toNumber(),
            authorId: book.AuthorOnBook[0]?.authorId ?? "",
            stripeId: book.stripeId,
            description: book.description,
            stock: book.stock,
            amount: 1,
            prevPrice: book.prevPrice.toNumber(),
        }))

    return (
        <main className="flex-grow">
            <HeroSection></HeroSection>
            <div className="container mx-auto px-4 py-12 flex flex-col gap-10">
                <HorizontalList
                    title="Mais Vendidos"
                    books={formatBooks(bestSellingBooks)}
                />

                <HorizontalList
                    title="Lançamentos"
                    books={formatBooks(newBooks)}
                />

                <HorizontalAuthorList
                    title="Principais Autores"
                    authors={authors.map((author) => ({
                        id: author.id,
                        img: author.imgUrl,
                        name: author.name,
                    }))}
                ></HorizontalAuthorList>

                <SuperCategoriesSection
                    superCategories={superCategories.map((sc) => ({
                        id: sc.id,
                        iconSvg: sc.iconSvg ?? undefined,
                        name: sc.name,
                        categories: sc.Category.map((c) => ({
                            id: c.id,
                            name: c.name,
                        })),
                    }))}
                />
            </div>
        </main>
    )
}

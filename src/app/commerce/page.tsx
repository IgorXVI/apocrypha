import { db } from "~/server/db"

import Link from "next/link"

import { convertSvgToImgSrc } from "~/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import HorizontalList from "./_components/horizontal-list"
import HeroSection from "./_components/hero-section"

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
            <h2 className="text-3xl font-bold mb-8 text-center">Compre por Categoria</h2>
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
                                    {superCategory.categories.map((category) => (
                                        <li key={category.id}>
                                            <Link
                                                href={`/category/${category.id}`}
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
    const [books, superCategories] = await Promise.all([
        db.book.findMany({
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

    return (
        <main className="flex-grow">
            <HeroSection></HeroSection>
            <div className="container mx-auto px-4 py-12">
                <HorizontalList
                    title="Livros mais vendidos"
                    books={books.map((book) => ({
                        id: book.id,
                        title: book.title,
                        mainImg: book.DisplayImage[0]?.url ?? "",
                        author: book.AuthorOnBook[0]?.Author.name ?? "",
                        price: book.price.toNumber(),
                        authorId: book.AuthorOnBook[0]?.authorId ?? "",
                        stripeId: book.stripeId,
                        description: book.description,
                    }))}
                />

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

import { db } from "~/server/db"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import HorizontalList from "./_components/horizontal-list"

function HeroSection() {
    return (
        <div className="bg-primary text-white bg-hero-pattern rounded-md">
            <div className="px-4 text-center bg-black bg-opacity-35 min-h-full min-w-full py-20 rounded-md">
                <h1 className="text-5xl font-bold mb-4">Descubra seu próximo livro favorito</h1>
                <p className="text-xl mb-8">Explore nossa vasta coleção de livros em todos os gêneros</p>
                <Button
                    size="lg"
                    variant="secondary"
                >
                    Começar a navegar
                </Button>
            </div>
        </div>
    )
}

function SuperCategoriesSection(props: {
    superCategories: {
        id: string
        name: string
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
                            <AccordionTrigger className="text-lg font-semibold">{superCategory.name}</AccordionTrigger>
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
                },
            },
        }),
    ])

    return (
        <main className="flex-grow">
            <HeroSection />
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

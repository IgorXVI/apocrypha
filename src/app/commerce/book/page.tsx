import { type Prisma } from "@prisma/client"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"

import { db } from "~/server/db"
import BookCard from "../_components/book-card"

type SuperCategory = {
    id: string
    name: string
    Category: {
        id: string
        name: string
        CategoryOnBook: {
            Book: {
                id: string
                title: string
                stripeId: string
                description: string
                price: Prisma.Decimal
                DisplayImage: {
                    url: string
                }[]
                AuthorOnBook: {
                    Author: {
                        id: string
                        name: string
                    }
                }[]
            }
        }[]
    }[]
}

type Book = {
    id: string
    title: string
    mainImg: string
    price: number
    author: string
    stripeId: string
    description: string
    authorId: string
}

type SuperCategoryWithAll = {
    id: string
    name: string
    Category: {
        id: string
        name: string
    }[]
}

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams: {
        superCategoryId?: string
        categoryId?: string
        priceRangeFrom?: string
        priceRangeTo?: string
        sortBy?: string
    }
}) {
    const priceRangeFrom = searchParams.priceRangeFrom ? Number(searchParams.priceRangeFrom) : 0
    const priceRangeTo = searchParams.priceRangeTo ? Number(searchParams.priceRangeTo) : 20
    const priceRange = [priceRangeFrom, priceRangeTo]

    const sortBy = searchParams.sortBy ?? "title"

    const allSuperCategories: SuperCategoryWithAll[] = await db.superCategory.findMany({
        include: {
            Category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    })

    allSuperCategories.unshift({
        id: "all",
        name: "Todos",
        Category: [],
    })

    let superCategory: SuperCategory | null = searchParams.superCategoryId
        ? await db.superCategory.findUnique({
              where: {
                  id: searchParams.superCategoryId,
              },
              include: {
                  Category: {
                      include: {
                          CategoryOnBook: {
                              include: {
                                  Book: {
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
                                              include: {
                                                  Author: {
                                                      select: {
                                                          name: true,
                                                          id: true,
                                                      },
                                                  },
                                              },
                                              orderBy: {
                                                  main: "asc",
                                              },
                                              take: 1,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                  },
              },
          })
        : null

    if (!superCategory) {
        const allBooks = await db.book.findMany({
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
                    include: {
                        Author: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                    orderBy: {
                        main: "asc",
                    },
                    take: 1,
                },
            },
        })

        const fakeSuperCategory = {
            id: "all",
            name: "Todos",
            Category: [
                {
                    id: "all",
                    name: "Todos",
                    CategoryOnBook: allBooks.map((book) => ({
                        Book: book,
                    })),
                },
            ],
        }

        superCategory = fakeSuperCategory
    }

    const selectedSuperCategoryId = superCategory.id

    const selectedCategory = searchParams.categoryId ? superCategory?.Category.find((category) => category.id === searchParams.categoryId) : undefined

    const selectedCategoryId = selectedCategory ? selectedCategory.id : "all"

    const unformatedBooks = selectedCategory
        ? selectedCategory.CategoryOnBook.map((categoryOnBook) => categoryOnBook.Book)
        : superCategory?.Category.flatMap((category) => category.CategoryOnBook.map((categoryOnBook) => categoryOnBook.Book))

    const books: Book[] = unformatedBooks.map((book) => ({
        id: book.id,
        title: book.title,
        mainImg: book.DisplayImage[0]?.url ?? "",
        price: book.price.toNumber(),
        author: book.AuthorOnBook[0]?.Author.name ?? "",
        description: book.description,
        authorId: book.AuthorOnBook[0]?.Author.id ?? "",
        stripeId: book.stripeId,
    }))

    return (
        <main className="grid grid-cols-1 md:grid-cols-7 container mx-auto px-4 py-8 md:gap-7 gap-2 md:place-content-start place-content-center">
            <h1 className="text-3xl font-bold col-span-full">Livros</h1>

            {/* Sidebar for desktop */}
            <aside className="md:col-span-1 flex flex-col gap-6 px-4 md:px-0">
                <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={selectedSuperCategoryId}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {allSuperCategories.map((superCategory) => (
                                <SelectItem
                                    key={superCategory.id}
                                    value={superCategory.id}
                                >
                                    {superCategory.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Select value={selectedCategoryId}>
                        <SelectTrigger id="subcategory">
                            <SelectValue placeholder="Selecione a subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {superCategory?.Category.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Preço</Label>
                    <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={priceRange}
                        className="mt-2"
                    />
                    <div className="flex justify-between mt-2">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                </div>
                <div>
                    <Label htmlFor="sort">Ordenar por</Label>
                    <Select value={sortBy}>
                        <SelectTrigger id="sort">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">Título</SelectItem>
                            <SelectItem value="author">Autor</SelectItem>
                            <SelectItem value="price-asc">Preço: Menor para maior</SelectItem>
                            <SelectItem value="price-desc">Preço: Maior para menor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </aside>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:col-span-6 col-span-full">
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        {...book}
                    />
                ))}
            </div>

            {books.length === 0 && <p className="text-center text-muted-foreground mt-8 col-span-full">Nenhum livro encontrado nesta categoria.</p>}
        </main>
    )
}

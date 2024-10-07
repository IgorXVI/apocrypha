import { type Prisma } from "@prisma/client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "~/components/ui/card"
import AddToCartButton from "../_components/add-to-cart-button"

import { db } from "~/server/db"
import { BooksFilters } from "../_components/books-filters"
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

export default async function BooksPage({
    searchParams,
}: {
    searchParams: {
        superCategoryId?: string
        categoryId?: string
        priceRangeFrom?: string
        priceRangeTo?: string
        sortBy?: string
        searchTerm?: string
    }
}) {
    const priceRangeFrom = searchParams.priceRangeFrom ? Number(searchParams.priceRangeFrom) : 0
    const priceRangeTo = searchParams.priceRangeTo ? Number(searchParams.priceRangeTo) : 999
    const priceRange: [number, number] = [priceRangeFrom, priceRangeTo]
    const searchTerm = searchParams.searchTerm ?? ""

    const sortBy = searchParams.sortBy ?? "title"

    const allSuperCategories: SuperCategoryWithAll[] = await db.superCategory.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            Category: {
                orderBy: {
                    name: "asc",
                },
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

    let superCategory: SuperCategory | null =
        searchParams.superCategoryId && searchParams.superCategoryId !== "all"
            ? await db.superCategory.findUnique({
                  where: {
                      id: searchParams.superCategoryId,
                  },
                  include: {
                      Category: {
                          orderBy: {
                              name: "asc",
                          },
                          include: {
                              CategoryOnBook: {
                                  orderBy: {
                                      Book:
                                          sortBy === "title"
                                              ? {
                                                    title: "asc",
                                                }
                                              : sortBy === "price-asc"
                                                ? {
                                                      price: "asc",
                                                  }
                                                : {
                                                      price: "desc",
                                                  },
                                  },
                                  where: {
                                      Book: {
                                          OR: [
                                              {
                                                  title: {
                                                      contains: searchTerm,
                                                      mode: "insensitive",
                                                  },
                                              },
                                              {
                                                  AuthorOnBook: {
                                                      some: {
                                                          Author: {
                                                              name: {
                                                                  contains: searchTerm,
                                                                  mode: "insensitive",
                                                              },
                                                          },
                                                      },
                                                  },
                                              },
                                          ],
                                          price: {
                                              gte: priceRange[0],
                                              lte: priceRange[1],
                                          },
                                      },
                                  },
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
            where: {
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    {
                        AuthorOnBook: {
                            some: {
                                Author: {
                                    name: {
                                        contains: searchTerm,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        },
                    },
                ],
                price: {
                    gte: priceRange[0],
                    lte: priceRange[1],
                },
            },
            orderBy:
                sortBy === "title"
                    ? {
                          title: "asc",
                      }
                    : sortBy === "price-asc"
                      ? {
                            price: "asc",
                        }
                      : {
                            price: "desc",
                        },
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

    const categories = superCategory.Category.map((category) => ({
        id: category.id,
        name: category.name,
    }))

    if (selectedSuperCategoryId !== "all") {
        categories.unshift({
            id: "all",
            name: "Todos",
        })
    }

    return (
        <main className="grid grid-cols-1 md:grid-cols-10 container mx-auto px-4 py-8 gap-7 md:place-content-start place-content-center">
            <h1 className="text-3xl font-bold col-span-full">Livros{searchTerm !== "" && ` - ${searchTerm}`}</h1>

            <div className="md:col-span-2 col-span-full">
                <BooksFilters
                    superCategories={allSuperCategories.map((superCategory) => ({
                        id: superCategory.id,
                        name: superCategory.name,
                    }))}
                    categories={categories}
                    selectedSuperCategoryId={selectedSuperCategoryId}
                    selectedCategoryId={selectedCategoryId}
                    priceRange={priceRange}
                    sortBy={sortBy}
                />
            </div>

            {books.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:col-span-8 col-span-full">
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                        ></BookCard>
                    ))}
                </div>
            )}

            {books.length === 0 && (
                <p className="md:col-span-8 col-span-ful place-self-center text-center min-h-[50vh] flex flex-col items-center justify-center">
                    Nenhum livro encontrado.
                </p>
            )}
        </main>
    )
}

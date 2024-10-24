import { type Prisma } from "@prisma/client"

import { db } from "~/server/db"
import { BooksFilters } from "../_components/books-filters"
import BookCard from "../_components/book-card"
import { type BookClientSideState } from "~/lib/types"
import { calcSkip } from "~/lib/utils"
import PaginationNumbers from "~/components/pagination/pagination-numbers"

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
        page?: string
    }
}) {
    const currentPage = Number(searchParams.page) || 1
    const currentTake = 20

    const priceRangeFrom = searchParams.priceRangeFrom ? Number(searchParams.priceRangeFrom) : 0
    const priceRangeTo = searchParams.priceRangeTo ? Number(searchParams.priceRangeTo) : 999
    const priceRange: [number, number] = [priceRangeFrom, priceRangeTo]
    const searchTerm = searchParams.searchTerm ?? ""

    const sortBy = searchParams.sortBy ?? "title"
    const superCategoryId = searchParams.superCategoryId ?? "all"

    const allSuperCategories = await db.superCategory.findMany({
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
        iconSvg: "",
    })

    const superCategory:
        | {
              id: string
              name: string
              Category: {
                  id: string
                  name: string
              }[]
          }
        | undefined = allSuperCategories.find((sc) => sc.id === superCategoryId)

    if (!superCategory) {
        return <p>Categoria não encontrada</p>
    }

    const selectedSuperCategoryId = superCategory.id

    const selectedCategory = searchParams.categoryId ? superCategory?.Category.find((category) => category.id === searchParams.categoryId) : undefined

    const selectedCategoryId = selectedCategory ? selectedCategory.id : "all"

    const whereBooks: Prisma.BookWhereInput = {
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
    }

    if (selectedCategoryId !== "all") {
        whereBooks.CategoryOnBook = {
            every: {
                categoryId: selectedCategoryId,
            },
        }
    } else if (selectedSuperCategoryId !== "all") {
        whereBooks.CategoryOnBook = {
            every: {
                Category: {
                    superCategoryId,
                },
            },
        }
    }

    const bookCount = await db.book.count({
        where: whereBooks,
    })

    const DBBooks = await db.book.findMany({
        where: whereBooks,
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
                    order: "asc",
                },
                take: 1,
            },
        },
        take: currentTake,
        skip: calcSkip(currentPage, currentTake),
    })

    const books: BookClientSideState[] = DBBooks.map((book) => ({
        id: book.id,
        title: book.title,
        mainImg: book.DisplayImage[0]?.url ?? "",
        price: book.price.toNumber(),
        author: book.AuthorOnBook[0]?.Author.name ?? "",
        description: book.description,
        authorId: book.AuthorOnBook[0]?.Author.id ?? "",
        stripeId: book.stripeId,
        stock: book.stock,
        amount: 1,
        prevPrice: book.prevPrice.toNumber(),
    }))

    const categories = superCategory.Category.filter((category) => category.name === "Todos" || category.name !== superCategory.name).map(
        (category) => ({
            id: category.id,
            name: category.name,
        }),
    )

    categories.unshift({
        id: "all",
        name: "Todos",
    })

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
                <div className="flex flex-col md:col-span-8 col-span-full gap-10">
                    <div className="commerce-book-list">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                            ></BookCard>
                        ))}
                    </div>
                    <div className="flex items-center justify-center">
                        <PaginationNumbers
                            page={currentPage}
                            take={currentTake}
                            urlPageParamName="page"
                            total={bookCount}
                        ></PaginationNumbers>
                    </div>
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

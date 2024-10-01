"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { BookOpen, Search, ShoppingCart, Menu } from "lucide-react"

const categories = [
    {
        name: "Fiction",
        subcategories: ["Contemporary", "Historical", "Science Fiction", "Fantasy", "Horror"],
    },
    {
        name: "Non-Fiction",
        subcategories: ["Biography", "Self-Help", "History", "Science", "Travel"],
    },
    {
        name: "Mystery",
        subcategories: ["Crime", "Thriller", "Cozy Mystery", "Detective", "Suspense"],
    },
    {
        name: "Romance",
        subcategories: ["Contemporary", "Historical", "Paranormal", "Erotic", "Young Adult"],
    },
    {
        name: "Children's",
        subcategories: ["Picture Books", "Middle Grade", "Young Adult", "Educational", "Fantasy"],
    },
    {
        name: "Business",
        subcategories: ["Management", "Finance", "Entrepreneurship", "Marketing", "Economics"],
    },
]

// Mock data for books
const books = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 12.99,
        category: "Fiction",
        subcategory: "Contemporary",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 14.99,
        category: "Fiction",
        subcategory: "Historical",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        price: 11.99,
        category: "Fiction",
        subcategory: "Science Fiction",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 4,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: 9.99,
        category: "Romance",
        subcategory: "Historical",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 5,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        price: 13.99,
        category: "Fiction",
        subcategory: "Fantasy",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        price: 15.99,
        category: "Non-Fiction",
        subcategory: "History",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 7,
        title: "The Da Vinci Code",
        author: "Dan Brown",
        price: 11.99,
        category: "Mystery",
        subcategory: "Thriller",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 8,
        title: "The Very Hungry Caterpillar",
        author: "Eric Carle",
        price: 8.99,
        category: "Children's",
        subcategory: "Picture Books",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 9,
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        price: 12.99,
        category: "Business",
        subcategory: "Finance",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
]

export default function CategoriesPage() {
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name)
    const [selectedSubcategory, setSelectedSubcategory] = useState("All")

    const filteredBooks = books.filter(
        (book) => book.category === selectedCategory && (selectedSubcategory === "All" || book.subcategory === selectedSubcategory),
    )

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation Bar */}
            <header className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center space-x-2"
                        >
                            <BookOpen className="h-6 w-6" />
                            <span className="text-xl font-bold">BookStore</span>
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link
                                href="/books"
                                className="hover:underline"
                            >
                                Books
                            </Link>
                            <Link
                                href="/categories"
                                className="hover:underline"
                            >
                                Categories
                            </Link>
                            <Link
                                href="/about"
                                className="hover:underline"
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className="hover:underline"
                            >
                                Contact
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search books..."
                                    className="pl-8 w-[200px]"
                                />
                            </div>
                            <Button variant="outline">
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Book Categories</h1>

                <Tabs
                    defaultValue={categories[0]?.name}
                    className="mb-8"
                >
                    <TabsList className="mb-4 flex flex-wrap">
                        {categories.map((category) => (
                            <TabsTrigger
                                key={category.name}
                                value={category.name}
                                onClick={() => {
                                    setSelectedCategory(category.name)
                                    setSelectedSubcategory("All")
                                }}
                            >
                                {category.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {categories.map((category) => (
                        <TabsContent
                            key={category.name}
                            value={category.name}
                        >
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Button
                                    variant={selectedSubcategory === "All" ? "default" : "outline"}
                                    onClick={() => setSelectedSubcategory("All")}
                                >
                                    All
                                </Button>
                                {category.subcategories.map((subcategory) => (
                                    <Button
                                        key={subcategory}
                                        variant={selectedSubcategory === subcategory ? "default" : "outline"}
                                        onClick={() => setSelectedSubcategory(subcategory)}
                                    >
                                        {subcategory}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                        <Card
                            key={book.id}
                            className="flex flex-col"
                        >
                            <div className="aspect-[3/4] relative">
                                <img
                                    src={book.coverImage}
                                    alt={`Cover of ${book.title}`}
                                    className="object-cover w-full h-full rounded-t-lg"
                                />
                            </div>
                            <CardHeader className="p-4">
                                <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex-grow">
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                                <p className="text-sm mt-2">{book.subcategory}</p>
                            </CardContent>
                            <CardFooter className="p-4">
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-bold">${book.price.toFixed(2)}</span>
                                    <Button>Add to Cart</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredBooks.length === 0 && <p className="text-center text-muted-foreground mt-8">No books found in this category.</p>}
            </main>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">About Us</h3>
                            <p className="text-sm">
                                BookStore is your one-stop shop for all your reading needs. We offer a wide selection of books across various genres.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/faq"
                                        className="text-sm hover:underline"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/shipping"
                                        className="text-sm hover:underline"
                                    >
                                        Shipping
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/returns"
                                        className="text-sm hover:underline"
                                    >
                                        Returns
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">My Account</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/login"
                                        className="text-sm hover:underline"
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/register"
                                        className="text-sm hover:underline"
                                    >
                                        Register
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/orders"
                                        className="text-sm hover:underline"
                                    >
                                        Order History
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
                            <p className="text-sm mb-2">Subscribe to our newsletter</p>
                            <form className="flex">
                                <Input
                                    type="email"
                                    placeholder="Your email"
                                    className="rounded-r-none"
                                />
                                <Button
                                    type="submit"
                                    className="rounded-l-none"
                                >
                                    Subscribe
                                </Button>
                            </form>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center">
                        <p className="text-sm">&copy; 2024 BookStore. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

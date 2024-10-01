"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import { BookOpen, Search, ShoppingCart, Menu, ChevronLeft, ChevronRight } from "lucide-react"

const bestSellingBooks = [
    { id: 1, title: "The Midnight Library", author: "Matt Haig", price: 14.99, coverImage: "/placeholder.svg?height=400&width=300" },
    { id: 2, title: "Atomic Habits", author: "James Clear", price: 12.99, coverImage: "/placeholder.svg?height=400&width=300" },
    { id: 3, title: "Where the Crawdads Sing", author: "Delia Owens", price: 15.99, coverImage: "/placeholder.svg?height=400&width=300" },
    { id: 4, title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", price: 13.99, coverImage: "/placeholder.svg?height=400&width=300" },
    {
        id: 5,
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        price: 16.99,
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    { id: 6, title: "Project Hail Mary", author: "Andy Weir", price: 14.99, coverImage: "/placeholder.svg?height=400&width=300" },
]

const popularCategories = [
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

export default function LandingPage() {
    const [scrollPosition, setScrollPosition] = useState(0)
    const sliderRef = useRef<HTMLDivElement>(null)

    const handleScroll = (direction: "left" | "right") => {
        if (sliderRef.current) {
            const scrollAmount = 300
            const newPosition =
                direction === "left"
                    ? Math.max(0, scrollPosition - scrollAmount)
                    : Math.min(sliderRef.current.scrollWidth - sliderRef.current.clientWidth, scrollPosition + scrollAmount)
            sliderRef.current.scrollTo({ left: newPosition, behavior: "smooth" })
            setScrollPosition(newPosition)
        }
    }

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
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-primary to-primary-foreground text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl font-bold mb-4">Discover Your Next Great Read</h1>
                        <p className="text-xl mb-8">Explore our vast collection of books across all genres</p>
                        <Button
                            size="lg"
                            variant="secondary"
                        >
                            Start Browsing
                        </Button>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-12">
                    {/* Best Selling Books Horizontal List */}
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold mb-8 text-center">Best Selling Books</h2>
                        <div className="relative">
                            <div
                                ref={sliderRef}
                                className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
                            >
                                {bestSellingBooks.map((book) => (
                                    <Card
                                        key={book.id}
                                        className="flex-shrink-0 w-48"
                                    >
                                        <div className="aspect-[3/4] relative">
                                            <img
                                                src={book.coverImage}
                                                alt={`Cover of ${book.title}`}
                                                className="object-cover w-full h-full rounded-t-lg"
                                            />
                                        </div>
                                        <CardHeader className="p-3">
                                            <CardTitle className="line-clamp-1 text-sm">{book.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            <p className="text-xs text-muted-foreground">{book.author}</p>
                                            <p className="text-sm font-bold mt-1">${book.price.toFixed(2)}</p>
                                        </CardContent>
                                        <CardFooter className="p-3 pt-0">
                                            <Button className="w-full text-xs">Add to Cart</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10 bg-background"
                                onClick={() => handleScroll("left")}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10 bg-background"
                                onClick={() => handleScroll("right")}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </section>

                    {/* Popular Categories with Subcategories */}
                    <section className="mb-16">
                        <h2 className="text-3xl font-bold mb-8 text-center">Popular Categories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularCategories.map((category) => (
                                <Accordion
                                    key={category.name}
                                    type="single"
                                    collapsible
                                    className="w-full"
                                >
                                    <AccordionItem value={category.name}>
                                        <AccordionTrigger className="text-lg font-semibold">{category.name}</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="space-y-2">
                                                {category.subcategories.map((subcategory) => (
                                                    <li key={subcategory}>
                                                        <Link
                                                            href={`/category/${category.name.toLowerCase()}/${subcategory.toLowerCase()}`}
                                                            className="text-sm text-muted-foreground hover:text-foreground"
                                                        >
                                                            {subcategory}
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
                </div>
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

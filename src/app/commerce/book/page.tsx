"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { Search, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet"

// Mock data for books
const allBooks = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 12.99,
        category: "Fiction",
        subcategory: "Classic",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 14.99,
        category: "Fiction",
        subcategory: "Classic",
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
        category: "Fiction",
        subcategory: "Romance",
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
        category: "Fiction",
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
        category: "Non-Fiction",
        subcategory: "Finance",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 10,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        price: 10.99,
        category: "Fiction",
        subcategory: "Coming-of-age",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 11,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 11.99,
        category: "Fiction",
        subcategory: "Philosophical",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
    {
        id: 12,
        title: "Dune",
        author: "Frank Herbert",
        price: 14.99,
        category: "Fiction",
        subcategory: "Science Fiction",
        coverImage: "/placeholder.svg?height=400&width=300",
    },
]

const categories = ["All", ...new Set(allBooks.map((book) => book.category))]
const subcategories = ["All", ...new Set(allBooks.map((book) => book.subcategory))]

export default function BooksPage() {
    const [books, setBooks] = useState(allBooks)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedSubcategory, setSelectedSubcategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 20])
    const [sortBy, setSortBy] = useState("title")

    useEffect(() => {
        let filteredBooks = allBooks.filter(
            (book) => book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (selectedCategory !== "All") {
            filteredBooks = filteredBooks.filter((book) => book.category === selectedCategory)
        }

        if (selectedSubcategory !== "All") {
            filteredBooks = filteredBooks.filter((book) => book.subcategory === selectedSubcategory)
        }

        filteredBooks = filteredBooks.filter((book) => book.price >= (priceRange[0] ?? 0) && book.price <= (priceRange[1] ?? 20))

        filteredBooks.sort((a, b) => {
            if (sortBy === "title") return a.title.localeCompare(b.title)
            if (sortBy === "author") return a.author.localeCompare(b.author)
            if (sortBy === "price-asc") return a.price - b.price
            if (sortBy === "price-desc") return b.price - a.price
            return 0
        })

        setBooks(filteredBooks)
    }, [searchTerm, selectedCategory, selectedSubcategory, priceRange, sortBy])

    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">All Books</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar for desktop */}
                <aside className="w-full md:w-64 space-y-6 hidden md:block">
                    <div>
                        <Label htmlFor="desktop-search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="desktop-search"
                                placeholder="Search books..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Select
                            value={selectedSubcategory}
                            onValueChange={setSelectedSubcategory}
                        >
                            <SelectTrigger id="subcategory">
                                <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                                {subcategories.map((subcategory) => (
                                    <SelectItem
                                        key={subcategory}
                                        value={subcategory}
                                    >
                                        {subcategory}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Price Range</Label>
                        <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mt-2"
                        />
                        <div className="flex justify-between mt-2">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="sort">Sort By</Label>
                        <Select
                            value={sortBy}
                            onValueChange={setSortBy}
                        >
                            <SelectTrigger id="sort">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="author">Author</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </aside>

                {/* Filter button for mobile */}
                <div className="md:hidden mb-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Apply filters to refine your book search.</SheetDescription>
                            </SheetHeader>
                            <div className="space-y-6 mt-4">
                                <div>
                                    <Label htmlFor="mobile-search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="mobile-search"
                                            placeholder="Search books..."
                                            value={searchTerm}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="mobile-category">Category</Label>
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={setSelectedCategory}
                                    >
                                        <SelectTrigger id="mobile-category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="mobile-subcategory">Subcategory</Label>
                                    <Select
                                        value={selectedSubcategory}
                                        onValueChange={setSelectedSubcategory}
                                    >
                                        <SelectTrigger id="mobile-subcategory">
                                            <SelectValue placeholder="Select subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subcategories.map((subcategory) => (
                                                <SelectItem
                                                    key={subcategory}
                                                    value={subcategory}
                                                >
                                                    {subcategory}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Price Range</Label>
                                    <Slider
                                        min={0}
                                        max={20}
                                        step={1}
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span>${priceRange[0]}</span>
                                        <span>${priceRange[1]}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="mobile-sort">Sort By</Label>
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger id="mobile-sort">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="title">Title</SelectItem>
                                            <SelectItem value="author">Author</SelectItem>
                                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Book Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
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
                                    <p className="text-sm mt-2">
                                        {book.category} - {book.subcategory}
                                    </p>
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
                    {books.length === 0 && <p className="text-center text-muted-foreground mt-8">No books found matching your criteria.</p>}
                </div>
            </div>
        </main>
    )
}

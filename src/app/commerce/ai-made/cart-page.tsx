"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Minus, Plus, ShoppingCart, Trash2, Menu } from "lucide-react"

// Mock data for cart items
const initialCartItems = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 12.99, quantity: 1, coverImage: "/placeholder.svg?height=80&width=60" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 14.99, quantity: 2, coverImage: "/placeholder.svg?height=80&width=60" },
    { id: 3, title: "1984", author: "George Orwell", price: 11.99, quantity: 1, coverImage: "/placeholder.svg?height=80&width=60" },
]

export default function ShoppingCartPage() {
    const [cartItems, setCartItems] = useState(initialCartItems)

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return
        setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }

    const removeItem = (id: number) => {
        setCartItems((items) => items.filter((item) => item.id !== id))
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1 // Assuming 10% tax
    const total = subtotal + tax

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
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="lg:w-2/3">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Product</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cartItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <img
                                                    src={item.coverImage}
                                                    alt={`Cover of ${item.title}`}
                                                    className="w-16 h-20 object-cover"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <h3 className="font-semibold">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">{item.author}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        className="w-16 text-center"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-1/3">
                            <div className="bg-muted p-6 rounded-lg">
                                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-6">Proceed to Checkout</Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-xl mb-4">Your cart is empty</p>
                        <Button asChild>
                            <Link href="/books">Continue Shopping</Link>
                        </Button>
                    </div>
                )}
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

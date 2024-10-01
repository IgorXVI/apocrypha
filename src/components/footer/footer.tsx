import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

export default function Footer() {
    return (
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
    )
}

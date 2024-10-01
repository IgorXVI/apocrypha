import Link from "next/link"

import { Menu } from "lucide-react"

import { Sheet, SheetTrigger, SheetContent } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"

export default function MenuSheet() {
    return (
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                    >
                        <Menu className="h-7 w-7" />
                        <span className="sr-only">Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="sm:max-w-xs bg-black opacity-50 text-white"
                >
                    <nav className="grid gap-6 text-lg font-medium pt-5 text-white">
                        <Link
                            href="/admin"
                            className="hover:underline"
                        >
                            Admin
                        </Link>
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
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}

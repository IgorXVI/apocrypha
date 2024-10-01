import Link from "next/link"

export default function DesktopHeaderNav() {
    return (
        <nav className="hidden md:flex space-x-4">
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
    )
}

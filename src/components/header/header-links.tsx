import Link from "next/link"

export const headerLinks = [
    <Link
        key="/admin"
        href="/admin"
        className="hover:underline"
    >
        Admin
    </Link>,
    <Link
        key="/books"
        href="/books"
        className="hover:underline"
    >
        Livros
    </Link>,
    <Link
        key="/categories"
        href="/categories"
        className="hover:underline"
    >
        Categorias
    </Link>,
    <Link
        key="/about"
        href="/about"
        className="hover:underline"
    >
        Sobre nós
    </Link>,
    <Link
        key="/contact"
        href="/contact"
        className="hover:underline"
    >
        Contato
    </Link>,
]

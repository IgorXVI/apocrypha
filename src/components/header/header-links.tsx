import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { type UserMetadata } from "~/lib/types"

export default function HeaderLinks() {
    const { sessionClaims } = auth()

    const userMetadata = sessionClaims?.metadata as UserMetadata | undefined

    const isAdmin = userMetadata?.isAdmin ?? false

    return (
        <>
            {isAdmin && (
                <Link
                    key="/admin"
                    href="/admin"
                    className="hover:underline"
                >
                    Admin
                </Link>
            )}
            <Link
                key="/commerce/book"
                href="/commerce/book"
                className="hover:underline"
            >
                Livros
            </Link>
            <Link
                key="/commerce/author"
                href="/commerce/author"
                className="hover:underline"
            >
                Autores
            </Link>
            <Link
                key="/commerce/user/order"
                href="/commerce/user/order"
                className="hover:underline"
            >
                Meus Pedidos
            </Link>
            <Link
                key="/commerce/user/wish-list"
                href="/commerce/user/wish-list"
                className="hover:underline"
            >
                Meus Favoritos
            </Link>
            <Link
                key="/commerce/contact"
                href="/commerce/contact"
                className="hover:underline"
            >
                Contato
            </Link>
            <Link
                key="/commerce/about"
                href="/commerce/about"
                className="hover:underline"
            >
                Sobre
            </Link>
        </>
    )
}

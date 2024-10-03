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
                key="/books"
                href="/commerce/book"
                className="hover:underline"
            >
                Livros
            </Link>
            <Link
                key="/about"
                href="/about"
                className="hover:underline"
            >
                Sobre
            </Link>
            <Link
                key="/contact"
                href="/contact"
                className="hover:underline"
            >
                Contato
            </Link>
        </>
    )
}

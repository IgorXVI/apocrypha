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
                    href="/admin"
                    className="hover:underline"
                >
                    Admin
                </Link>
            )}
            <Link
                href="/commerce/book"
                className="hover:underline"
            >
                Livros
            </Link>
            <Link
                href="/commerce/user/order"
                className="hover:underline"
            >
                Meus Pedidos
            </Link>
            <Link
                href="/commerce/user/wish-list"
                className="hover:underline"
            >
                Meus Favoritos
            </Link>
            <Link
                href="/commerce/contact"
                className="hover:underline"
            >
                Contato
            </Link>
        </>
    )
}

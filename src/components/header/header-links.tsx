import Link from "next/link"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { type UserMetadata } from "~/lib/types"

const cClient = clerkClient()

export default async function HeaderLinks() {
    const user = auth()

    const isAdmin = user.userId
        ? await cClient.users
              .getUser(user.userId)
              .then((user) => (user?.privateMetadata as UserMetadata | undefined)?.isAdmin ?? false)
              .catch((error) => {
                  console.error(error)
                  return false
              })
        : false

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

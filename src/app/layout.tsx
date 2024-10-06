import "~/styles/globals.css"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"

import { Toaster } from "~/components/ui/sonner"
import StoreProvider from "~/components/redux/StoreProvider"
import { env } from "~/env"

export const metadata: Metadata = {
    title: env.APP_NAME,
    description: `${env.APP_NAME} é sua loja de livros online. Oferecemos uma ampla seleção de livros em vários gêneros. Criada por Igor Almeida.`,
    icons: {
        icon: [
            {
                media: "(prefers-color-scheme: light)",
                url: "/images/favicon-light.svg",
                href: "/images/favicon-light.svg",
            },
            {
                media: "(prefers-color-scheme: dark)",
                url: "/images/favicon-dark.svg",
                href: "/images/favicon-dark.svg",
            },
        ],
    },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider localization={ptBR}>
            <html
                lang="pt"
                className={`${GeistSans.variable}`}
            >
                <body className="min-h-screen">
                    <StoreProvider>{children}</StoreProvider>
                    <Toaster></Toaster>
                </body>
            </html>
        </ClerkProvider>
    )
}

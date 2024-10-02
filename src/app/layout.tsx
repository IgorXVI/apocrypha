import "~/styles/globals.css"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"

import { Toaster } from "~/components/ui/sonner"
import StoreProvider from "~/components/redux/StoreProvider"

export const metadata: Metadata = {
    title: "Apocrypha",
    description: "Apocrypha é sua loja de livros online. Oferecemos uma ampla seleção de livros em vários gêneros. Criada por Igor Almeida.",
    icons: [{ rel: "icon", url: "/favicon.svg" }],
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

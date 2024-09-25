import "~/styles/globals.css"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"

import { Toaster } from "~/components/ui/sonner"
import Header from "~/components/header"

export const metadata: Metadata = {
    title: "Loja do Igor",
    description: "Generated by Igor Almeida",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider localization={ptBR}>
            <html
                lang="pt"
                className={`${GeistSans.variable}`}
            >
                <body className="min-h-screen">
                    <Header></Header>
                    <div className="md:mr-[7vw] md:ml-[7vw] mt-5">{children}</div>
                    <Toaster></Toaster>
                </body>
            </html>
        </ClerkProvider>
    )
}

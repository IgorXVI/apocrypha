import "~/styles/globals.css"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"

import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"

export const metadata: Metadata = {
    title: "Loja do Igor",
    description: "Generated by Igor Almeida",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider localization={ptBR}>
            <html lang="pt" className={`${GeistSans.variable}`}>
                <body className="bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white min-h-screen">
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}

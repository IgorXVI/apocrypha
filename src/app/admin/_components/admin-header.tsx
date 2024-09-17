import Link from "next/link"

import { Home, Menu, Crown } from "lucide-react"

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet"

import { Button } from "~/components/ui/button"
import HeaderUserButton from "~/components/header/header-user-button"

function MenuSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="default"
                    className="hover:border-white border border-gray-600"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium pt-5">
                    <Link
                        href="/"
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <Home className="h-5 w-5" />
                        Página Inicial
                    </Link>
                    <Link
                        href="/admin"
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <Crown className="h-5 w-5" />
                        Admin
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}

export default function AdminHeader() {
    return (
        <header className="flex flex-row justify-between items-center w-screen text-white bg-black p-2 pr-7 pl-5">
            <MenuSheet></MenuSheet>
            <HeaderUserButton></HeaderUserButton>
        </header>
    )
}

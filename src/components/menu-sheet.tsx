import Link from "next/link"

import { Home, PanelLeft, Crown } from "lucide-react"

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "./ui/sheet"

import { Button } from "./ui/button"

export default function MenuSheet() {
    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Menu</span>
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
                            href="#"
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <Crown className="h-5 w-5" />
                            Admin
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}

import Link from "next/link"

import { Menu, Crown } from "lucide-react"

import { Sheet, SheetTrigger, SheetContent } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"

export default function MenuSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                >
                    <Menu className="h-7 w-7" />
                    <span className="sr-only">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="sm:max-w-xs bg-black opacity-50 text-white"
            >
                <nav className="grid gap-6 text-lg font-medium pt-5 text-white">
                    <Link
                        href="/admin"
                        className="flex items-center gap-4 px-2.5 hover:text-blue-500 hover:underline"
                    >
                        <Crown className="h-5 w-5" />
                        Admin
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}

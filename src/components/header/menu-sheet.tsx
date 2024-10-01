import { Menu } from "lucide-react"

import { Sheet, SheetTrigger, SheetContent } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"

import { headerLinks } from "./header-links"

export default function MenuSheet() {
    return (
        <div className="md:hidden">
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
                    <nav className="grid gap-6 text-lg font-medium pt-5 text-white">{...headerLinks}</nav>
                </SheetContent>
            </Sheet>
        </div>
    )
}

import HeaderBase from "~/components/header/header-base"
import HeaderUserButton from "~/components/header/header-user-button"
import ProductSearch from "./product-search"
import CompanyIconButton from "~/components/header/company-icon-button"
import UserAddress from "./user-address"
import CartButton from "./cart-button"
import FavoritesButton from "./favorites-button"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Menu } from "lucide-react"
import HeaderLinks from "~/components/header/header-links"

function DesktopHeaderNav() {
    return (
        <nav className="flex flex-row gap-8">
            <HeaderLinks />
        </nav>
    )
}

function MenuSheet() {
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
                    <HeaderLinks />
                </nav>
            </SheetContent>
        </Sheet>
    )
}

export default function CommerceHeader() {
    return (
        <>
            <HeaderBase>
                <div className="flex gap-1 xl:gap-3 justify-center items-center mr-auto xl:mr-0">
                    <div className="xl:hidden">
                        <MenuSheet></MenuSheet>
                    </div>
                    <CompanyIconButton></CompanyIconButton>
                </div>

                <div className="hidden xl:block">
                    <UserAddress></UserAddress>
                </div>

                <div className="hidden xl:block mx-10">
                    <DesktopHeaderNav></DesktopHeaderNav>
                </div>

                <ProductSearch></ProductSearch>

                <div className="flex justify-center gap-6 items-center p-2">
                    <FavoritesButton></FavoritesButton>
                    <CartButton></CartButton>
                    <HeaderUserButton></HeaderUserButton>
                </div>
            </HeaderBase>
            <div className="pb-2 items-center justify-center flex flex-grow flex-nowrap text-nowrap text-white bg-black xl:hidden">
                <UserAddress></UserAddress>
            </div>
        </>
    )
}

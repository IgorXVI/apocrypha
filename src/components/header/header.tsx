import { MapPin } from "lucide-react"

import HeaderUserButton from "./header-user-button"
import MenuSheet from "./menu-sheet"
import ShoppingCartButton from "./shopping-cart-button"
import SearchBar from "./search-bar"
import StoreIconButton from "./store-icon-button"

export default function Header() {
    return (
        <header className="flex flex-col w-screen text-white">
            <div className="bg-black flex flex-col gap-1 px-2 pb-4">
                <div className="flex justify-between items-center">
                    <div className="flex justify-between items-center">
                        <MenuSheet></MenuSheet>
                        <StoreIconButton></StoreIconButton>
                    </div>
                    <div className="flex justify-between gap-5 items-center p-2">
                        <ShoppingCartButton></ShoppingCartButton>
                        <HeaderUserButton></HeaderUserButton>
                    </div>
                </div>
                <SearchBar></SearchBar>
            </div>
            <div className="flex bg-slate-600 text-sm items-center p-2">
                <div className="flex items-center rounded gap-1">
                    <MapPin className="h-6 w-6"></MapPin>
                    <div className="flex leading-tight text-xs">
                        <span>Olá</span>
                        <span className="font-bold pl-1">Selecione o endereço</span>
                    </div>
                </div>
            </div>
        </header>
    )
}

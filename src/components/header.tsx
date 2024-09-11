import HeaderUserButton from "./header-user-button"
import MenuSheet from "./menu-sheet"

import { ShoppingCartIcon, SearchIcon, MapPin } from "lucide-react"

export default function Header() {
    return (
        <header className="flex flex-col w-screen text-white">
            <div className="bg-black flex flex-col p-2 gap-1 pb-4">
                <div className="flex justify-between items-center">
                    <div className="flex justify-between items-center">
                        <MenuSheet></MenuSheet>
                        <a href="/">
                            <img
                                src="favicon.ico"
                                alt="Logo da loja"
                                className="h-7"
                            />
                        </a>
                    </div>

                    <div className="flex justify-between gap-6 items-center p-2">
                        <div className="rounded-sm relative">
                            <ShoppingCartIcon className="h-7 w-7"></ShoppingCartIcon>
                            <span className=" text-white absolute -top-2 left-6 text-center w-6 h-6 bg-slate-600 rounded-full">
                                0
                            </span>
                        </div>
                        <HeaderUserButton></HeaderUserButton>
                    </div>
                </div>

                <form action="" className="flex-grow flex p-1">
                    <input
                        type="text"
                        className="flex-grow rounded-l text-black p-2"
                    />
                    <button className="bg-blue-500 hover:bg-blue-300 rounded-tr rounded-br p-2">
                        <SearchIcon></SearchIcon>
                    </button>
                </form>
            </div>
            <div className="flex bg-slate-600 text-sm items-center p-2">
                <div className="flex items-center rounded gap-1">
                    <MapPin className="h-6 w-6"></MapPin>
                    <div className="flex leading-tight text-xs">
                        <span>Olá</span>
                        <span className="font-bold pl-1">
                            Selecione o endereço
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}

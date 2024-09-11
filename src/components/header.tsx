import HeaderUserButton from "./header-user-button"
import MenuSheet from "./menu-sheet"

import { ShoppingCartIcon, SearchIcon, MapPin } from "lucide-react"

export default function Header() {
    return (
        <header>
            <div className="text-white w-screen">
                <div className="flex flex-wrap bg-black px-2 py-1 items-center gap-1">
                    <MenuSheet></MenuSheet>
                    <div className="flex mx-2 py-2 mr-auto">
                        <a href="/">
                            <img
                                src="favicon.ico"
                                alt="Logo da loja"
                                className="h-7"
                            />
                        </a>
                    </div>
                    <div className="p-2 rounded-sm relative flex">
                        <ShoppingCartIcon size={28}></ShoppingCartIcon>
                        <span className=" text-white absolute top-0 left-6 text-center w-6 h-6 bg-slate-600 rounded-full">
                            0
                        </span>
                    </div>
                    <div className="flex pr-2">
                        <HeaderUserButton></HeaderUserButton>
                    </div>
                    <div className="w-full flex  mr-0 pt-2 pb-2 ">
                        <form action="" className="flex flex-grow">
                            <input
                                type="text"
                                className="p-2 flex-grow rounded-l text-black"
                            />
                            <button className="px-4 bg-blue-500 hover:bg-blue-300 rounded-tr rounded-br">
                                <SearchIcon></SearchIcon>
                            </button>
                        </form>
                    </div>
                </div>
                <div className="flex bg-slate-600 text-sm px-2 py-1 items-center">
                    <div className="flex items-center rounded px-2 py-2 ">
                        <div className="mr-1">
                            <MapPin></MapPin>
                        </div>
                        <div className="flex  leading-tight text-xs">
                            <p className="mx-1">Olá</p>
                            <p className="font-bold">Selecione o endereço</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

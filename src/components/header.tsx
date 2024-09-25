import Link from "next/link"

import { MapPin, Home, Menu, Crown, ShoppingCart, SearchIcon } from "lucide-react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet"

import { Button } from "./ui/button"

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
                    <Link
                        href="/"
                        className="flex items-center gap-4 px-2.5 hover:text-blue-500 hover:underline"
                    >
                        <Home className="h-5 w-5" />
                        Página Inicial
                    </Link>
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

function HeaderUserButton() {
    return (
        <>
            <SignedIn>
                <UserButton></UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton></SignInButton>
            </SignedOut>
        </>
    )
}

export default function Header() {
    return (
        <header className="flex flex-col w-full text-white justify-center">
            <div className="bg-black flex flex-row flex-wrap md:flex-nowrap md:justify-between items-center gap-1 md:gap-5 px-2 pb-3 md:px-8 md:pt-3">
                <div className="flex gap-1 md:gap-3 justify-center items-center mr-auto md:mr-0">
                    <MenuSheet></MenuSheet>
                    <Link href="/">
                        <img
                            src="favicon.ico"
                            alt="Logo da loja"
                            className="h-7"
                        />
                    </Link>
                    <div className="hidden md:flex items-center rounded gap-1 ml-5">
                        <MapPin className="h-7 w-7"></MapPin>
                        <span className="font-bold text-sm ml-2">
                            Olá Selecione <br /> o endereço
                        </span>
                    </div>
                </div>

                <form
                    action=""
                    className="self-center flex justify-center items-center flex-grow md:max-w-2xl order-1 md:order-none px-1 lg:mr-32"
                >
                    <input
                        type="text"
                        className="flex-grow rounded-l text-black p-2"
                    />
                    <button className="bg-blue-500 hover:bg-blue-300 rounded-tr rounded-br p-2">
                        <SearchIcon></SearchIcon>
                    </button>
                </form>

                <div className="flex justify-center gap-6 items-center p-2">
                    <div className="rounded-sm relative">
                        <ShoppingCart className="h-7 w-7"></ShoppingCart>
                        <span className=" text-white absolute -top-1 left-5 text-center w-5 h-5 text-sm bg-slate-600 rounded-full">0</span>
                    </div>
                    <div className="flex items-center justify-center mt-1">
                        <HeaderUserButton></HeaderUserButton>
                    </div>
                </div>
            </div>
            <div className="flex md:hidden bg-slate-600 text-sm items-center gap-10 p-2 md:px-10">
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

import Link from "next/link"

import { MapPin, Home, Menu, Crown, ShoppingCart, SearchIcon } from "lucide-react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"

import { Button } from "./ui/button"

function StoreIconButton() {
    return (
        <a href="/">
            <img
                src="favicon.ico"
                alt="Logo da loja"
                className="h-7"
            />
        </a>
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
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="sm:max-w-xs"
            >
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
        <header className="flex flex-col w-full text-white">
            <div className="bg-black flex flex-row flex-wrap items-center justify-between gap-1 px-2 pb-3 md:px-[5vw] md:pt-3">
                <div className="flex gap-2 justify-center items-center">
                    <MenuSheet></MenuSheet>
                    <StoreIconButton></StoreIconButton>
                </div>
                <form
                    action=""
                    className="flex justify-center items-center flex-grow md:w-1/2 md:flex-grow-0 order-1 md:order-none px-2"
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
            <div className="md:hidden flex bg-slate-600 text-sm items-center p-2 md:px-[5vw]">
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

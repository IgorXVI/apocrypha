import HeaderUserButton from "./header-user-button"
import MenuSheet from "./menu-sheet"

function SearchIconSVG() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
        </svg>
    )
}

function ShoppingCartSVG() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
        </svg>
    )
}

function MapPinSVG() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
        </svg>
    )
}

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
                        <ShoppingCartSVG></ShoppingCartSVG>
                        <span className="bold text-white text-base absolute top-0 left-0 -mt-1 ml-4 text-center w-6 h-6 bg-slate-600 rounded-full">
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
                            <button className="px-4 bg-blue-500 hover:bg-white rounded-tr rounded-br">
                                <SearchIconSVG></SearchIconSVG>
                            </button>
                        </form>
                    </div>
                </div>
                <div className="flex bg-slate-600 text-sm px-2 py-1 items-center">
                    <div className="flex items-center rounded px-2 py-2 ">
                        <div className="mr-1">
                            <MapPinSVG></MapPinSVG>
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

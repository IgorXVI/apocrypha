import { SearchIcon } from "lucide-react"

export default function SearchBar() {
    return (
        <form action="" className="flex justify-center">
            <input type="text" className="flex-grow rounded-l text-black p-2" />
            <button className="bg-blue-500 hover:bg-blue-300 rounded-tr rounded-br p-2">
                <SearchIcon></SearchIcon>
            </button>
        </form>
    )
}

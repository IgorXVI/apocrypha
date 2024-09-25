import { SearchIcon } from "lucide-react"

export default function ProductSearch() {
    return (
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
    )
}

import { SearchIcon } from "lucide-react"
import { Input } from "~/components/ui/input"

export default function ProductSearch() {
    return (
        <form
            action=""
            className="self-center flex justify-center items-center flex-grow md:max-w-2xl order-1 md:order-none px-1 lg:mr-32 relative"
        >
            <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Procure livros..."
                className="flex-grow rounded-l text-black p-2 pl-8"
            />
        </form>
    )
}

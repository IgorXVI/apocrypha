"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { Input } from "~/components/ui/input"
import { useCallback } from "react"
import { useDebouncedCallback } from "use-debounce"

export default function ProductSearch() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const updateQueryParams = useCallback(
        (name: string, value: string) => {
            if (value === "") {
                const params = new URLSearchParams(searchParams.toString())
                params.delete(name)
                router.push(`${pathname}?${params.toString()}`)
                return
            }

            const params = new URLSearchParams(searchParams.toString())

            params.set(name, value)

            if (!pathname.includes("commerce/book")) {
                router.push(`/commerce/book?${params.toString()}`)
                return
            }

            router.push(`${pathname}?${params.toString()}`)
        },
        [pathname, router, searchParams],
    )

    return (
        <div className="self-center flex justify-center items-center flex-grow md:max-w-2xl order-1 md:order-none px-1 lg:mr-32 relative">
            <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Procure livros..."
                className="flex-grow rounded-l text-black p-2 pl-8"
                onChange={useDebouncedCallback((e) => updateQueryParams("searchTerm", e.target.value), 300)}
            />
        </div>
    )
}

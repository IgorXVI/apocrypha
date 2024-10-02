"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LoaderIcon, SearchIcon } from "lucide-react"
import { Input } from "~/components/ui/input"
import { useCallback, useTransition, useState } from "react"
import { Button } from "~/components/ui/button"

export default function ProductSearch() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()

    const updateQueryParams = useCallback(
        () =>
            startTransition(() => {
                if (searchTerm === "") {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("searchTerm")
                    router.push(`${pathname}?${params.toString()}`)
                    return
                }

                const params = new URLSearchParams(searchParams.toString())

                params.set("searchTerm", searchTerm)

                if (!pathname.endsWith("commerce/book")) {
                    router.push(`/commerce/book?${params.toString()}`)
                    return
                }

                router.push(`${pathname}?${params.toString()}`)
            }),
        [pathname, router, searchParams, searchTerm],
    )

    return (
        <div className="self-center flex justify-center items-center flex-grow md:max-w-2xl order-1 md:order-none px-1 lg:mr-32 relative">
            <Input
                disabled={isPending}
                type="text"
                placeholder="Procure livros..."
                className="flex-grow rounded-l text-black p-2 pr-14"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        updateQueryParams()
                    }
                }}
            />

            {isPending && <LoaderIcon className="absolute right-2 top-2 animate-spin mr-2" />}

            <Button
                disabled={isPending}
                onClick={updateQueryParams}
                variant={"default"}
                size={"sm"}
                className="absolute right-1.5 top-0.5"
            >
                <SearchIcon size={20} />
            </Button>
        </div>
    )
}

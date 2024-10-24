"use client"

import { LoaderIcon, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Input } from "~/components/ui/input"

export default function ParamsSearch({ paramName }: { paramName: string }) {
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
                    params.delete(paramName)
                    router.push(`${pathname}?${params.toString()}`)
                    return
                }

                const params = new URLSearchParams(searchParams.toString())

                params.set(paramName, searchTerm)

                router.push(`${pathname}?${params.toString()}`)
            }),
        [paramName, pathname, router, searchParams, searchTerm],
    )

    return (
        <div className="self-center flex justify-center items-center flex-grow md:max-w-lg px-1 relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <Input
                defaultValue={searchParams.get(paramName) ?? undefined}
                disabled={isPending}
                type="text"
                placeholder="Procure..."
                className="w-full rounded-lg bg-background pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        updateQueryParams()
                    }
                }}
            />

            {isPending && <LoaderIcon className="absolute right-2 top-2 animate-spin mr-2" />}
        </div>
    )
}

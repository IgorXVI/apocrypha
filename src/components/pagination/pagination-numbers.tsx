"use client"

import { useSearchParams, usePathname } from "next/navigation"
import React, { useCallback, useMemo } from "react"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination"

export default function PaginationNumbers(props: { total: number; urlPageParamName: string; page: number; take: number }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const maxPage = useMemo(() => Math.ceil(props.total / props.take), [props.total, props.take])

    const getChangedPageLink = useCallback(
        (page: number) => {
            const params = new URLSearchParams(searchParams)

            params.set(props.urlPageParamName, page.toString())

            return `${pathname}?${params.toString()}`
        },
        [searchParams, pathname, props.urlPageParamName],
    )

    const getNextPageLink = useCallback(
        (offset: number) => {
            const params = new URLSearchParams(searchParams)

            const newPage = props.page + offset

            if (newPage <= 0) {
                return pathname
            }

            params.set(props.urlPageParamName, newPage.toString())

            return `${pathname}?${params.toString()}`
        },
        [searchParams, pathname, props.page, props.urlPageParamName],
    )

    return (
        <div className="flex flex-row gap-2 text-sm justify-between">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>{props.page !== 1 && <PaginationPrevious href={props.page === 1 ? "#" : getNextPageLink(-1)} />}</PaginationItem>

                    {props.page - 5 > 1 && (
                        <div className="hidden md:flex">
                            <PaginationItem>
                                <PaginationLink href={getChangedPageLink(1)}>1</PaginationLink>
                            </PaginationItem>

                            {props.page - 6 !== 1 && <PaginationEllipsis />}
                        </div>
                    )}

                    <PaginationItem className="hidden md:block">
                        {props.page - 5 > 0 && <PaginationLink href={getNextPageLink(-5)}>{props.page - 5}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {props.page - 4 > 0 && <PaginationLink href={getNextPageLink(-4)}>{props.page - 4}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {props.page - 3 > 0 && <PaginationLink href={getNextPageLink(-3)}>{props.page - 3}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {props.page - 2 > 0 && <PaginationLink href={getNextPageLink(-2)}>{props.page - 2}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {props.page - 1 > 0 && <PaginationLink href={getNextPageLink(-1)}>{props.page - 1}</PaginationLink>}
                    </PaginationItem>

                    <PaginationItem>
                        {maxPage > 1 && (
                            <PaginationLink
                                href="#"
                                isActive
                            >
                                {props.page}
                            </PaginationLink>
                        )}
                    </PaginationItem>

                    <PaginationItem className="hidden md:block">
                        {maxPage >= props.page + 1 && <PaginationLink href={getNextPageLink(1)}>{props.page + 1}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {maxPage >= props.page + 2 && <PaginationLink href={getNextPageLink(2)}>{props.page + 2}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {maxPage >= props.page + 3 && <PaginationLink href={getNextPageLink(3)}>{props.page + 3}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {maxPage >= props.page + 4 && <PaginationLink href={getNextPageLink(4)}>{props.page + 4}</PaginationLink>}
                    </PaginationItem>
                    <PaginationItem className="hidden md:block">
                        {maxPage >= props.page + 5 && <PaginationLink href={getNextPageLink(5)}>{props.page + 5}</PaginationLink>}
                    </PaginationItem>

                    {maxPage > props.page + 5 && (
                        <div className="hidden md:flex">
                            {props.page + 6 !== maxPage && <PaginationEllipsis />}
                            <PaginationItem>
                                <PaginationLink href={getChangedPageLink(maxPage)}>{maxPage}</PaginationLink>
                            </PaginationItem>
                        </div>
                    )}

                    <PaginationItem>
                        {props.page < maxPage && <PaginationNext href={maxPage > props.page ? getNextPageLink(1) : "#"} />}
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

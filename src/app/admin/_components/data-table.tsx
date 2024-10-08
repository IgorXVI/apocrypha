"use client"

import * as R from "remeda"
import React, { useMemo } from "react"
import { MoreHorizontal, PlusCircle, LoaderCircle, CircleX, AlertCircle, CheckIcon, XIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import FieldTooLong from "./field-too-long"
import Image from "next/image"
import { convertSvgToImgSrc } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { type Prisma } from "prisma/prisma-client"
import PaginationNumbers from "~/components/pagination/pagination-numbers"

type PossibleTableCellTypes = string | number | Prisma.Decimal | Date | undefined | null | unknown[] | React.ReactNode

export default function DataTable(props: {
    name: string
    namePlural: string
    tableDescription: string
    rows: Record<string, PossibleTableCellTypes>[]
    tableHeaders: Record<string, string>
    tableValuesMap?: Record<string, (value: PossibleTableCellTypes) => React.ReactNode | string>
    isLoading: boolean
    isError: boolean
    isSuccess: boolean
    pagination: {
        total: number
        urlPageParamName: string
        page: number
        take: number
    }
    onCreate?: () => void
    tableRowActions?: {
        label: string
        actions: {
            label: string
            onClick: (rowId: string) => void
        }[]
    }
}) {
    const headers = useMemo(() => Object.values(props.tableHeaders), [props.tableHeaders])

    const headerKeys = useMemo(() => Object.keys(props.tableHeaders), [props.tableHeaders])

    return (
        <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader>
                <CardTitle>{R.capitalize(props.namePlural)}</CardTitle>
                <CardDescription>{props.tableDescription}</CardDescription>
            </CardHeader>
            {props.isLoading && (
                <div className="flex w-full justify-center items-center h-[80vh]">
                    <LoaderCircle
                        width={100}
                        height={100}
                        className="animate-spin"
                    ></LoaderCircle>
                </div>
            )}
            {props.isError && (
                <div className="flex w-full justify-center items-center h-[80vh]">
                    <CircleX
                        width={100}
                        height={100}
                        color="red"
                    ></CircleX>
                </div>
            )}
            {props.isSuccess && props.rows.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-center h-[80vh]">
                    <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sem {props.namePlural}</h3>
                    <p className="text-sm text-neutral-500 mb-4">Parece que não há dados para {props.namePlural} cadastrados ainda.</p>

                    {props.onCreate && (
                        <Button
                            onClick={props.onCreate}
                            className="flex items-center"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar {props.name}
                        </Button>
                    )}
                </div>
            )}
            {props.isSuccess && props.rows.length !== 0 && (
                <>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="text-nowrap">
                                    {(props.tableRowActions ? [props.tableRowActions.label].concat(headers) : headers).map((text, index) => (
                                        <TableHead
                                            key={index}
                                            className="text-center"
                                        >
                                            {text}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {props.rows.map((row) => (
                                    <TableRow key={row.id as string}>
                                        {props.tableRowActions && (
                                            <TableCell className="grid place-content-center border-r-[1px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            aria-haspopup="true"
                                                            size="icon"
                                                            variant="ghost"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{props.tableRowActions.label}</DropdownMenuLabel>
                                                        {props.tableRowActions.actions.map((action, index) => (
                                                            <DropdownMenuItem
                                                                key={index}
                                                                onClick={() => action.onClick(row.id as string)}
                                                            >
                                                                {action.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                        {headerKeys.map((attr, index) => (
                                            <TableCell
                                                key={attr}
                                                className={`${index < headerKeys.length - 1 ? "border-r-[1px]" : ""}`}
                                            >
                                                <div className="flex items-center justify-center w-full">
                                                    {props.tableValuesMap?.[attr] ? (
                                                        props.tableValuesMap[attr](row[attr])
                                                    ) : typeof row[attr] === "string" && attr.includes("Url") && row[attr] ? (
                                                        <Image
                                                            alt={attr}
                                                            className="aspect-square rounded-md object-cover"
                                                            src={row[attr]}
                                                            height="64"
                                                            width="64"
                                                        />
                                                    ) : typeof row[attr] === "string" && attr.endsWith("Svg") && row[attr] ? (
                                                        <img
                                                            src={convertSvgToImgSrc(row[attr])}
                                                            alt={attr}
                                                            className="aspect-square rounded-md object-cover"
                                                            height="64"
                                                            width="64"
                                                        />
                                                    ) : typeof row[attr] === "boolean" ? (
                                                        row[attr] ? (
                                                            <CheckIcon className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XIcon className="w-4 h-4 text-red-500" />
                                                        )
                                                    ) : typeof row[attr] === "string" && attr.endsWith("Date") ? (
                                                        new Date(row[attr]).toLocaleDateString()
                                                    ) : !row[attr] ? (
                                                        "N/A"
                                                    ) : row[attr] instanceof Date ? (
                                                        row[attr].toLocaleDateString()
                                                    ) : typeof row[attr] === "string" ? (
                                                        <FieldTooLong
                                                            content={row[attr]}
                                                            numberOfCols={headers.length}
                                                        ></FieldTooLong>
                                                    ) : React.isValidElement(row[attr]) ? (
                                                        row[attr]
                                                    ) : (
                                                        JSON.stringify(row[attr] ?? {})
                                                    )}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                    <CardFooter className="grid place-content-center">
                        <PaginationNumbers {...props.pagination}></PaginationNumbers>
                    </CardFooter>
                </>
            )}
        </Card>
    )
}

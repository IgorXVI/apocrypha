import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const convertSvgToImgSrc = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const calcSkip = (page: number, take: number) => take * (page - 1)

const getDateOffset = (date: Date, offsetInDays: number) =>
    new Date(date.getTime() + offsetInDays * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })

export const calcShippingDate = (updatedAt: Date, min: number, max: number) =>
    min === max ? getDateOffset(updatedAt, min) : `Entre ${getDateOffset(updatedAt, min)} e ${getDateOffset(updatedAt, max)}`

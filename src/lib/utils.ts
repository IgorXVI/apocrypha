import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { generateUploadButton } from "@uploadthing/react"

import type { OurFileRouter } from "~/app/api/uploadthing/core"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const UploadButton = generateUploadButton<OurFileRouter>()

export const convertSvgToImgSrc = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

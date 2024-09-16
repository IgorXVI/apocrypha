import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
    generateReactHelpers,
    generateUploadButton,
    generateUploadDropzone,
} from "@uploadthing/react"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import type { OurFileRouter } from "~/app/api/uploadthing/core"

export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
export const { useUploadThing } = generateReactHelpers<OurFileRouter>()

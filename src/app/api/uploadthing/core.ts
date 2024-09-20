/* eslint-disable @typescript-eslint/only-throw-error */
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@clerk/nextjs/server"

const f = createUploadthing()

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
        .middleware(async () => {
            const user = auth()

            if (!user.userId) throw new UploadThingError("Unauthorized")

            return { userId: user.userId }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId)

            console.log("file url", file.url)

            return { uploadedBy: metadata.userId }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

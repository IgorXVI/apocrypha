/* eslint-disable @typescript-eslint/only-throw-error */
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@clerk/nextjs/server"
import { type UserMetadata } from "~/lib/types"

const f = createUploadthing()

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
        .middleware(async () => {
            const user = auth()

            const userMetadata = user.sessionClaims?.metadata as UserMetadata | undefined

            const isAdmin = userMetadata?.isAdmin ?? false

            if (!isAdmin) {
                throw new UploadThingError("User has no upload permissions")
            }

            return { userId: user.userId }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId)

            console.log("file url", file.url)

            return { uploadedBy: metadata.userId }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

import fs from "fs"
import path from "path"

import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Bucket, createS3Client } from "node-scripts/s3"

const s3Client = createS3Client()

const main = async () => {
    const outputPath = path.resolve("./node-scripts/resize-imgs/resized-imgs")

    const localImgPaths = fs
        .readdirSync(outputPath)
        .filter((f) => f.startsWith("book-img"))
        .map((f) => `${outputPath}\\${f}`)

    const getUniqueKey = (/** @type {string} */ s) => s?.split("\\").pop()

    const imgFileBuffers = await Promise.all(localImgPaths.map((f) => fs.promises.readFile(f)))

    const s3Commands = imgFileBuffers.map(
        (buff, i) =>
            new PutObjectCommand({
                Bucket: s3Bucket,
                Key: getUniqueKey(localImgPaths[i] ?? ""),
                Body: buff,
                ContentType: `image/${localImgPaths[i]?.split(".").pop()}`.replace("/jpg", "/jpeg"),
            }),
    )

    console.log("SAVING FILES ON S3...")
    await Promise.all(s3Commands.map((c) => s3Client.send(c)))
    console.log("SAVED FILES ON S3")
}

main().catch((error) => console.error(error))

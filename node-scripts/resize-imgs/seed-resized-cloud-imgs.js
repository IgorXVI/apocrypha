import fs from "fs"
import path from "path"
import dotenv from "dotenv"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

dotenv.config()

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCES_KEY ?? "",
    },
})

const s3Bucket = process.env.S3_IMG_BUCKET

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

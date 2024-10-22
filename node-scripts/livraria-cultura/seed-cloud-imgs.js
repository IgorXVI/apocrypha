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

const s3Bucket = "apocrypha-bucket-book-imgs-5bfe43ee-e15a-4c6d-be9d-bc6556535ac8"

const main = async () => {
    const fileContent = fs.readFileSync(path.resolve("./node-scripts/livraria-cultura/dump/new-books-local-imgs.json"))

    /** @type {{ mainImgUrl: string; }[]} */
    const fileJSON = JSON.parse(fileContent.toString())

    const localImgPaths = fileJSON.map((book) => book.mainImgUrl)

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

    fileJSON.forEach((book) => {
        const imgUrlKey = getUniqueKey(book.mainImgUrl)
        book.mainImgUrl = `https://d32155ei7f8k3w.cloudfront.net/${imgUrlKey}`
    })

    console.log(fileJSON[0])

    fs.writeFileSync(path.resolve("./node-scripts/livraria-cultura/main-dump/new-books-cloud-imgs.json"), JSON.stringify(fileJSON))

    console.log("DONE")
}

main().catch((error) => console.error(error))

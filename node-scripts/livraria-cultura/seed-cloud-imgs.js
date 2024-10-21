import fs from "fs"
import path from "path"
import dotenv from "dotenv"

import { S3Client, PutObjectCommand, paginateListObjectsV2 } from "@aws-sdk/client-s3"

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

    const paginator = paginateListObjectsV2(
        {
            client: s3Client,
        },
        {
            Bucket: s3Bucket,
        },
    )

    /** @type {Record<string, boolean>} */
    let s3Map = {}

    for await (const data of paginator) {
        data.Contents?.forEach((c) => {
            s3Map[c.Key ?? ""] = true
        })
    }

    console.log(Object.keys(s3Map).length)

    const getUniqueKey = (/** @type {string} */ s) => s?.split("\\").pop()

    const filtredImgPaths = localImgPaths.filter((lp) => !s3Map[getUniqueKey(lp) ?? ""])

    console.log(filtredImgPaths.length)

    const imgFileBuffers = await Promise.all(filtredImgPaths.map((f) => fs.promises.readFile(f)))

    const s3Commands = imgFileBuffers.map(
        (buff, i) =>
            new PutObjectCommand({
                Bucket: s3Bucket,
                Key: getUniqueKey(filtredImgPaths[i] ?? ""),
                Body: buff,
                ContentType: `image/${filtredImgPaths[i]?.split(".").pop()}`.replace("/jpg", "/jpeg"),
            }),
    )

    console.log("SAVING FILES ON S3...")
    await Promise.all(s3Commands.map((c) => s3Client.send(c)))
    console.log("SAVED FILES ON S3")

    fileJSON.forEach((book) => {
        const imgUrlKey = getUniqueKey(book.mainImgUrl)
        book.mainImgUrl = `https://${s3Bucket}.s3.amazonaws.com/${imgUrlKey}`
    })

    console.log(fileJSON[0])

    fs.writeFileSync(path.resolve("./node-scripts/livraria-cultura/main-dump/new-books-cloud-imgs.json"), JSON.stringify(fileJSON))

    console.log("DONE")
}

main().catch((error) => console.error(error))

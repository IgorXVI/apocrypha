import sharp from "sharp"

import fs from "fs"
import path from "path"

const main = async () => {
    const imgFolderPath = path.resolve("./node-scripts/livraria-cultura/dump")
    const outputPath = path.resolve("./node-scripts/resize-imgs/resized-imgs")

    const defaultBuff = fs.readFileSync(`${outputPath}\\default-cover.jpg`)

    const files = fs
        .readdirSync(imgFolderPath)
        .filter((f) => f.startsWith("book-img"))
        .map((f) => `${imgFolderPath}\\${f}`)

    const results = await Promise.all(
        files.map((file) =>
            sharp(file)
                .resize(250, 250, {
                    fit: "inside",
                    kernel: "nearest",
                    withoutReduction: true,
                    background: { alpha: 1, r: 255, g: 255, b: 255 },
                })
                .toBuffer()
                .then((buff) => fs.promises.writeFile(file.replace(imgFolderPath, outputPath), buff))
                .then(() => true)
                .catch((error) => {
                    console.error(`ERROR ON FILE "${file}":`, error.message)
                    return fs.promises
                        .writeFile(file.replace(imgFolderPath, outputPath), defaultBuff)
                        .then(() => true)
                        .catch((error) => {
                            console.error("ERROR TRYING TO SAVE DEFAULT BUFF:", error)
                            return false
                        })
                }),
        ),
    )

    console.log("ERRORS NOT RECOVERED:", results.filter((result) => !result).length)
}

main().catch((error) => console.error(error))

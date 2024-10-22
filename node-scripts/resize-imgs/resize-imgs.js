import sharp from "sharp"

import fs from "fs"
import path from "path"

const main = async () => {
    const imgFolderPath = path.resolve("./node-scripts/livraria-cultura/dump")
    const outputPath = path.resolve("./node-scripts/resize-imgs/resized-imgs")

    const defaultBuff = fs.readFileSync(`${outputPath}\\default-cover.png`)

    const defaultBuffBase64 = defaultBuff.toString("base64")

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
                .then((buff) => {
                    if (buff.toString("base64") === defaultBuffBase64) {
                        return false
                    }

                    return fs.promises.writeFile(file.replace(imgFolderPath, outputPath), buff).then(() => true)
                })
                .catch(() => false),
        ),
    )

    const emptyImages = results
        .map((r, i) => ({
            result: r,
            img: files[i],
        }))
        .filter((el) => !el.result)
        .map((el) => el.img)

    console.log("EMPTY:", emptyImages.length)

    fs.writeFileSync(path.resolve("./node-scripts/resize-imgs/empty-imgs.json"), JSON.stringify(emptyImages))
}

main().catch((error) => console.error(error))

import sharp from "sharp"

import fs from "fs"
import path from "path"

const main = async () => {
    const imgFolderPath = path.resolve("./node-scripts/livraria-cultura/dump")
    const outputPath = path.resolve("./node-scripts/resize-imgs/resized-imgs")

    const files = fs
        .readdirSync(imgFolderPath)
        .filter((f) => f.startsWith("book-img"))
        .map((f) => `${imgFolderPath}\\${f}`)

    await Promise.all(
        files.map((file) =>
            sharp(file)
                .resize(400, 400, {
                    fit: "inside",
                    withoutReduction: true,
                    background: { alpha: 1, r: 255, g: 255, b: 255 },
                })
                .toBuffer()
                .then((buff) => fs.promises.writeFile(file.replace(imgFolderPath, outputPath), buff).then(() => true))
                .catch(() => false),
        ),
    )
}

main().catch((error) => console.error(error))

import _ from "lodash"
import { db } from "../db.js"

const names = ["Constância Genoveva Mendes", "Celestino Lívia Martins"]

export const main = async () => {
    const books = await db.book.findMany({
        select: {
            id: true,
        },
    })

    const reviewsPerBook = books.flatMap((book) =>
        names.map((userName) => ({
            userId: `TESTE-${userName.replace(" ", "-")}`,
            userName,
            title: "String",
            body: "String",
            rating: _.random(2, 5),
            bookId: book.id,
        })),
    )

    await db.review.createMany({
        data: reviewsPerBook,
    })
}

main().catch((error) => console.error(error))

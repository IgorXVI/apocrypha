import { db } from "~/server/db"
import CommerceFooter from "./_components/commerce-footer"
import CommerceHeader from "./_components/commerce-header"
import StoreProvider from "~/components/redux/StoreProvider"
import { auth } from "@clerk/nextjs/server"
import { type BookClientSideState, type UserClientSideState } from "~/lib/types"
import { getBooksReviewsMap } from "~/server/book-queries"

export default async function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = auth()

    if (!user.userId) {
        return <p>Unauthorized</p>
    }

    const userState = await db.userState.findUnique({
        where: {
            userId: user.userId,
        },
    })

    let init: UserClientSideState | undefined
    if (userState) {
        init = {
            bookCart: userState.bookCart.map((item) => item?.valueOf() as BookClientSideState),
            bookFavs: userState.bookFavs.map((item) => item?.valueOf() as BookClientSideState),
        }

        const books = await db.book.findMany({
            where: {
                id: {
                    in: init.bookCart.map((bc) => bc.id).concat(init.bookFavs.map((bf) => bf.id)),
                },
            },
            select: {
                id: true,
                stock: true,
                price: true,
                prevPrice: true,
            },
            take: 200,
        })

        const booksReviewsMap = await getBooksReviewsMap(books.map((book) => book.id))

        books.forEach((book) => {
            const bookCartItem = init?.bookCart.find((bc) => bc.id === book.id)
            const bookFavsItem = init?.bookFavs.find((bf) => bf.id === book.id)

            const bookRating = booksReviewsMap.get(book.id)?.rating ?? 0
            const bookRatingAmount = booksReviewsMap.get(book.id)?.amount ?? 0

            if (bookCartItem) {
                bookCartItem.stock = book.stock
                bookCartItem.price = book.price.toNumber()
                bookCartItem.prevPrice = book.prevPrice.toNumber()
                bookCartItem.rating = bookRating
                bookCartItem.ratingAmount = bookRatingAmount
            }

            if (bookFavsItem) {
                bookFavsItem.stock = book.stock
                bookFavsItem.price = book.price.toNumber()
                bookFavsItem.prevPrice = book.prevPrice.toNumber()
                bookFavsItem.rating = bookRating
                bookFavsItem.ratingAmount = bookRatingAmount
            }
        })

        if (init?.bookCart) {
            init.bookCart = init.bookCart.filter((bc) => bc.stock > 0)
        }
    }

    return (
        <StoreProvider initialState={init}>
            <CommerceHeader></CommerceHeader>
            <div className="min-h-[80vh] mb-auto">{children}</div>
            <CommerceFooter></CommerceFooter>
        </StoreProvider>
    )
}

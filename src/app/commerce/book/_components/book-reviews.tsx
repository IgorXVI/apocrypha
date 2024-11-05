import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { calcSkip } from "~/lib/utils"
import { db } from "~/server/db"
import ReviewStars from "../../_components/review-stats"
import PaginationNumbers from "~/components/pagination/pagination-numbers"
import { authClient } from "~/server/auth-api"
import { type User } from "@clerk/nextjs/server"

export default async function BookReviews({
    bookId,
    reviewsCount,
    reviewsPageName,
    reviewsPage,
}: {
    bookId: string
    reviewsPageName: string
    reviewsCount: number
    reviewsPage?: string
}) {
    const page = Number(reviewsPage) || 1
    const take = 5
    const skip = calcSkip(page, take)

    const bookReviews = await db.review.findMany({
        where: {
            bookId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take,
        skip,
    })

    const userDataMap: Record<string, User> = {}
    const userDefaultName: Record<string, string> = {}

    if (bookReviews.length > 0) {
        const userData = await authClient.users.getUserList({
            limit: take,
            userId: bookReviews.map((review) => review.userId),
        })

        userData.data.forEach((user) => {
            userDataMap[user.id] = user
        })

        bookReviews.forEach((review) => {
            userDefaultName[review.userId] = review.userName
                .split(" ")
                .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                .map((s) => s.charAt(0))
                .join("")
        })
    }

    return bookReviews.length > 0 ? (
        <>
            <Separator className="my-6" />
            <h3
                className="text-lg font-semibold mb-4"
                id="book-reviews"
            >
                Avaliações
            </h3>
            {bookReviews.map((review) => (
                <Card
                    key={review.id}
                    className="mb-4"
                >
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center justify-start gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={userDataMap[review.userId]?.imageUrl}></AvatarImage>
                                <AvatarFallback>{userDefaultName[review.userId]}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                                <div className="flex flex-row gap-2">
                                    <p className="text-sm font-medium">{review.userName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {review.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                                    </p>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <ReviewStars rating={review.rating}></ReviewStars>
                                    <p className="text-lg font-bold">{review.title}</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.body}</p>
                    </CardContent>
                </Card>
            ))}
            <PaginationNumbers
                page={page}
                take={take}
                total={reviewsCount}
                urlPageParamName={reviewsPageName}
                sectionId="book-reviews"
            ></PaginationNumbers>
        </>
    ) : (
        <></>
    )
}

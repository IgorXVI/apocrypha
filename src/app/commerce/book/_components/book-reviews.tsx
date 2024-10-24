import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { calcSkip } from "~/lib/utils"
import { db } from "~/server/db"
import ReviewStars from "./review-stats"
import PaginationNumbers from "~/components/pagination/pagination-numbers"

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
    const currentReviewsPage = Number(reviewsPage) || 1
    const currentReviewsTake = 5

    const bookReviews = await db.review.findMany({
        where: {
            bookId,
        },
        take: currentReviewsTake,
        skip: calcSkip(currentReviewsPage, currentReviewsTake),
    })

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
                                <AvatarFallback>
                                    {review.userName
                                        .split(" ")
                                        .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                                        .map((s) => s.charAt(0))
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                                <p className="text-sm font-medium">{review.userName}</p>
                                <p className="text-lg font-bold">{review.title}</p>
                                <ReviewStars rating={review.rating}></ReviewStars>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.body}</p>
                    </CardContent>
                </Card>
            ))}
            <PaginationNumbers
                page={currentReviewsPage}
                take={currentReviewsTake}
                total={reviewsCount}
                urlPageParamName={reviewsPageName}
                sectionId="book-reviews"
            ></PaginationNumbers>
        </>
    ) : (
        <></>
    )
}

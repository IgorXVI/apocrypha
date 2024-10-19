import { Card, CardContent } from "~/components/ui/card"
import AddToCartButton from "./add-to-cart-button"
import Link from "next/link"
import Image from "next/image"
import FavoriteButton from "./add-to-favorite-button"
import { type BookClientSideState } from "~/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"

export default function BookCard({ book, hideAuthor }: { book: BookClientSideState; hideAuthor?: boolean }) {
    const priceDiff = book.price < book.prevPrice ? Math.ceil(100 * (1 - book.price / book.prevPrice)) : 0

    return (
        <Card className="min-w-[275px] max-w-[275px]">
            <div className="aspect-[3/4] relative">
                <Link
                    href={`/commerce/book/${book.id}`}
                    className="w-full h-full"
                >
                    <Image
                        src={book.mainImg}
                        alt={book.title}
                        className="object-cover w-full h-full rounded-t-md"
                        width={200}
                        height={200}
                    ></Image>
                </Link>
                <div className="absolute top-1 right-1">
                    <FavoriteButton
                        book={book}
                        size={32}
                    ></FavoriteButton>
                </div>
            </div>
            <CardContent>
                <div className="flex flex-col gap-2 mt-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="text-left">
                                <Link
                                    href={`/commerce/book/${book.id}`}
                                    className="hover:underline"
                                >
                                    <span className="line-clamp-1 text-lg font-bold">{book.title}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{book.title}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Link
                        href={`/commerce/author/${book.authorId}`}
                        className={`${hideAuthor ? "hidden" : ""}`}
                    >
                        <p className="text-sm text-muted-foreground hover:underline">{book.author}</p>
                    </Link>

                    <div className="flex flex-col justify-center gap-3">
                        <div className="flex flex-col justify-center">
                            {priceDiff > 10 && (
                                <p className="text-muted-foreground">
                                    De: <span className="line-through">R$ {book.prevPrice.toFixed(2)}</span>
                                </p>
                            )}
                            <div className="text-2xl flex flex-row gap-1">
                                {priceDiff > 10 && <span className="text-red-500 font-normal text-nowrap">-{priceDiff}%</span>}
                                <span className="text-green-500 font-bold text-nowrap">R$ {book.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <AddToCartButton
                            bookForCart={{
                                ...book,
                                amount: 1,
                            }}
                        ></AddToCartButton>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

import { Card, CardContent } from "~/components/ui/card"
import AddToCartButton from "./add-to-cart-button"
import Link from "next/link"
import Image from "next/image"
import FavoriteButton from "./add-to-favorite-button"
import { type BookClientSideState } from "~/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"

export default function BookCard({ book }: { book: BookClientSideState }) {
    return (
        <Card>
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

                    <Link href={`/commerce/author/${book.authorId}`}>
                        <p className="text-sm text-muted-foreground hover:underline">{book.author}</p>
                    </Link>

                    <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-2xl text-green-500">R$ {book.price.toFixed(2)}</p>
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

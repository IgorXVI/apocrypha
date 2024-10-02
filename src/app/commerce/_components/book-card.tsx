import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "~/components/ui/card"
import AddToCartButton from "./add-to-cart-button"

export default function BookCard(props: {
    id: string
    stripeId: string
    author: string
    authorId: string
    title: string
    description: string
    price: number
    mainImg: string
    imgWidth?: number
    imgHeight?: number
}) {
    return (
        <Card className={`min-w-[${props.imgWidth ?? 200}px]`}>
            <div className="aspect-[3/4] relative">
                <Link
                    href={`/commerce/book/${props.id}`}
                    className="w-full h-full"
                >
                    <Image
                        src={props.mainImg}
                        alt={`Cover of ${props.title}`}
                        className="object-cover w-full h-full rounded-t-md"
                        width={props.imgWidth ?? 200}
                        height={props.imgHeight ?? 200}
                    ></Image>
                </Link>
            </div>
            <CardContent>
                <div className="flex flex-col gap-2 mt-2">
                    <Link href={`/commerce/book/${props.id}`}>
                        <p className="hover:underline">
                            <span className="line-clamp-1 hover:line-clamp-none text-lg">{props.title}</span>
                        </p>
                    </Link>
                    <Link href={`/commerce/author/${props.authorId}`}>
                        <p className="text-sm text-muted-foreground hover:underline">{props.author}</p>
                    </Link>
                    <div className="flex flex-row items-center justify-between">
                        <p className="font-bold">R$ {props.price.toFixed(2)}</p>
                        <AddToCartButton
                            {...props}
                            amount={1}
                        ></AddToCartButton>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

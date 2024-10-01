import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
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
}) {
    return (
        <Card className="min-w-[250px]">
            <div className="aspect-[3/4] relative">
                <Link
                    href={`/commerce/book/${props.id}`}
                    className="w-full h-full"
                >
                    <Image
                        src={props.mainImg}
                        alt={`Cover of ${props.title}`}
                        className="object-cover w-full h-full rounded-t-md"
                        width={150}
                        height={150}
                    ></Image>
                </Link>
            </div>
            <CardHeader>
                <CardTitle>
                    <Link href={`/commerce/book/${props.id}`}>
                        <p className="hover:underline">
                            <span className="line-clamp-1 hover:line-clamp-none">
                                {props.title.split(":")[0]}
                                {props.title.includes(":") && ":"}
                            </span>
                            <span className="line-clamp-1 text-base font-normal hover:line-clamp-none">
                                {props.title.includes(":") ? props.title.split(":")[1] : <br />}
                            </span>
                        </p>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Link href={`/commerce/author/${props.authorId}`}>
                    <p className="text-sm text-muted-foreground hover:underline">{props.author}</p>
                </Link>
                <p className="mt-2 text-2xl font-bold">R$ {props.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
                <AddToCartButton
                    {...props}
                    amount={1}
                ></AddToCartButton>
            </CardFooter>
        </Card>
    )
}

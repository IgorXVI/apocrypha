import Image from "next/image"
import Link from "next/link"
import { type Prisma } from "prisma/prisma-client"
import { env } from "~/env"
import { db } from "~/server/db"

type Img = Prisma.DisplayImageGetPayload<Prisma.DisplayImageDefaultArgs>

function HeroImg({ img, size }: { img: Img; size: number }) {
    return (
        <Link
            key={img.id}
            href={`/commerce/book/${img.bookId}`}
            className="flex items-center justify-center hover:scale-150 hover:z-10 transition-all duration-300"
        >
            <Image
                src={img.url}
                alt="capa de um livro"
                className="object-contain rounded-lg"
                width={size}
                height={size}
            ></Image>
        </Link>
    )
}

function HeroImgs({ imgs }: { imgs: Img[] }) {
    const imgIndexMatrix: number[][] = [[0], [1, 2], [3, 4, 5], [6, 7], [8, 9, 10], [11, 12], [13]]

    return (
        <div className="grid grid-flow-col gap-2 place-content-center">
            {imgIndexMatrix.map((imgIndexes, i) => (
                <div
                    key={i}
                    className="grid gap-2 place-content-center"
                >
                    {imgIndexes.map((imgIndex) => {
                        const img = imgs[imgIndex]
                        return (
                            img && (
                                <HeroImg
                                    key={img.id}
                                    img={img}
                                    size={125}
                                ></HeroImg>
                            )
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

export default async function HeroSection() {
    const booksCount = await db.book.count()

    const amountOfBookImgs = 14

    const skip = Math.floor(Math.random() * (booksCount - amountOfBookImgs))

    const displayImgs = await db.displayImage.findMany({
        where: {
            order: 0,
        },
        take: amountOfBookImgs,
        skip,
    })

    return (
        <section className="bg-neutral-900 min-h-[600px]">
            <div className="flex items-center justify-around gap-1 py-8 lg:py-16">
                <div className="mt-5 px-8 mx-auto md:block grid place-items-center">
                    <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-white flex flex-col md:flex-row gap-3 items-center">
                        <Image
                            src="images/favicon-dark.svg"
                            alt="Logo"
                            width={200}
                            height={200}
                        />
                        {env.APP_NAME}
                    </h1>
                    <p className="max-w-xl mb-6 lg:mb-8 md:text-lg lg:text-xl text-neutral-200">
                        Descubra seu próximo livro favorito, explore nossa vasta coleção de {booksCount} livros em todos os gêneros.
                    </p>
                    <div className="grid place-content-center">
                        <Link
                            href="/commerce/book"
                            className="font-bold text-xl text-center border-2 border-white bg-neutral-900 hover:bg-neutral-700 text-white py-4 px-5 rounded-lg"
                        >
                            Explorar
                        </Link>
                    </div>
                </div>

                <div className="hidden lg:block lg:mr-16">
                    <HeroImgs imgs={displayImgs}></HeroImgs>
                </div>
            </div>
        </section>
    )
}

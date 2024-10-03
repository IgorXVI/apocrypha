import { BookOpenTextIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { db } from "~/server/db"

export default async function HeroSection() {
    const images = await db.displayImage.findMany({
        take: 5,
    })

    return (
        <section className="bg-gradient-to-b from-black to-transparent min-h-[500px]">
            <div className="grid py-8 lg:gap-8 lg:py-16 lg:grid-cols-12">
                <div className="mt-5 px-8 mx-auto place-self-center lg:col-span-8 md:block grid place-items-center">
                    <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-white flex flex-row gap-3 items-center">
                        <BookOpenTextIcon className="w-16 h-16 md:w-20 md:h-20" />
                        Apocrypha
                    </h1>
                    <p className="max-w-xl mb-6 font-light lg:mb-8 md:text-lg lg:text-xl text-neutral-200">
                        Descubra seu próximo livro favorito, explore nossa vasta coleção de livros em todos os gêneros.
                    </p>
                    <Button
                        size="lg"
                        variant="outline"
                    >
                        <Link
                            href="/commerce/book"
                            className="text-lg"
                        >
                            Começar a explorar
                        </Link>
                    </Button>
                </div>

                <div className="hidden lg:mt-0 lg:col-span-4 lg:flex"></div>
            </div>
        </section>
    )
}

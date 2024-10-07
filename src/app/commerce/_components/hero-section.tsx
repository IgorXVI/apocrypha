import Link from "next/link"
import { Button } from "~/components/ui/button"

export default async function HeroSection() {
    return (
        <section className="bg-gradient-to-b from-black to-white min-h-[400px]">
            <div className="py-8 lg:py-16 grid place-items-center gap-10">
                <p className="max-w-4xl text-3xl text-neutral-200">
                    Descubra seu próximo livro favorito, explore nossa vasta coleção de livros em todos os gêneros.
                </p>
                <Button size="lg">
                    <Link
                        href="/commerce/book"
                        className="text-lg"
                    >
                        Explorar
                    </Link>
                </Button>
            </div>
        </section>
    )
}

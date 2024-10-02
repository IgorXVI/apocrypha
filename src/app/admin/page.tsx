import Link from "next/link"
import { Button } from "~/components/ui/button"

export default function Admin() {
    return (
        <main className="flex text-xl gap-10 flex-col items-center justify-center mb-5 container mx-auto h-[75vh]">
            <h1 className="text-6xl font-extrabold text-center text-wrap">Administrar as Tabelas</h1>
            <div className="flex flex-col gap-3 list-none">
                <Link href="/admin/book">
                    <Button className="text-2xl w-full p-8">Livros</Button>
                </Link>

                <Link href="/admin/author">
                    <Button className="text-2xl w-full p-8">Autores</Button>
                </Link>

                <Link href="/admin/translator">
                    <Button className="text-2xl w-full p-8">Tradutores</Button>
                </Link>

                <Link href="/admin/publisher">
                    <Button className="text-2xl w-full p-8">Editoras</Button>
                </Link>

                <Link href="/admin/series">
                    <Button className="text-2xl w-full p-8">Séries</Button>
                </Link>

                <Link href="/admin/category">
                    <Button className="text-2xl w-full p-8">Categorias</Button>
                </Link>

                <Link href="/admin/super-category">
                    <Button className="text-2xl w-full p-8">Categorias Mães</Button>
                </Link>
            </div>
        </main>
    )
}

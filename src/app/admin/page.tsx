import Link from "next/link"

export default function Admin() {
    return (
        <main className="flex text-xl gap-3 flex-col items-center justify-center h-screen">
            <h1>OI ADEMIR</h1>
            <nav className="underline flex flex-col gap-3">
                <li>
                    <Link href="/admin/book">Livros</Link>
                </li>
                <li>
                    <Link href="/admin/author">Autores</Link>
                </li>
                <li>
                    <Link href="/admin/translator">Tradutores</Link>
                </li>
                <li>
                    <Link href="/admin/publisher">Editoras</Link>
                </li>
                <li>
                    <Link href="/admin/series">Séries</Link>
                </li>
                <li>
                    <Link href="/admin/category">Categorias</Link>
                </li>
                <li>
                    <Link href="/admin/language">Línguas</Link>
                </li>
                <li>
                    <Link href="/admin/currency">Moedas</Link>
                </li>
            </nav>
        </main>
    )
}

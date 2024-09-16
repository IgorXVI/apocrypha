export default function Admin() {
    return (
        <main className="flex text-6xl gap-12 flex-col items-center justify-center h-screen">
            <h1>OI ADEMIR</h1>
            <nav className="underline flex flex-col gap-10">
                <li>
                    <a href="/admin/books">Livros</a>
                </li>
                <li>
                    <a href="/admin/author">Autores</a>
                </li>
                <li>
                    <a href="/admin/translator">Tradutores</a>
                </li>
                <li>
                    <a href="/admin/publisher">Editoras</a>
                </li>
                <li>
                    <a href="/admin/series">Séries</a>
                </li>
                <li>
                    <a href="/admin/category">Categorias</a>
                </li>
                <li>
                    <a href="/admin/language">Línguas</a>
                </li>
                <li>
                    <a href="/admin/currency">Moedas</a>
                </li>
            </nav>
        </main>
    )
}

export default function Admin() {
    return (
        <main className="flex gap-5 flex-col items-center">
            <h1>OI ADEMIR</h1>
            <nav>
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

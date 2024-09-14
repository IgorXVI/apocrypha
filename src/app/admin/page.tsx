export default function Admin() {
    return (
        <main className="flex gap-5 flex-col items-center">
            <h1>OI ADEMIR</h1>
            <nav>
                <li>
                    <a href="/admin/books">Livros</a>
                </li>
                <li>
                    <a href="/admin/authors">Autores</a>
                </li>
                <li>
                    <a href="/admin/translators">Tradutores</a>
                </li>
                <li>
                    <a href="/admin/publishers">Editoras</a>
                </li>
                <li>
                    <a href="/admin/series">Séries</a>
                </li>
                <li>
                    <a href="/admin/categories">Categorias</a>
                </li>
                <li>
                    <a href="/admin/languages">Línguas</a>
                </li>
                <li>
                    <a href="/admin/currency">Moedas</a>
                </li>
            </nav>
        </main>
    )
}

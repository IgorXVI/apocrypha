import Link from "next/link"

export default function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                        <h3 className="col-span-full text-lg font-semibold">Sobre nós</h3>
                        <p className="text-sm">Magnaura é sua loja de livros online. Oferecemos uma ampla seleção de livros em vários gêneros.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Serviço ao consumidor</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-sm hover:underline"
                                >
                                    Perguntas frequentes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping"
                                    className="text-sm hover:underline"
                                >
                                    Entrega
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/returns"
                                    className="text-sm hover:underline"
                                >
                                    Devoluções
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Minha conta</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/orders"
                                    className="text-sm hover:underline"
                                >
                                    Histórico de pedidos
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center">
                    <p className="text-sm">&copy; 2024 Magnaura. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}

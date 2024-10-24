import Link from "next/link"
import CompanyIconButton from "~/components/header/company-icon-button"
import HeaderBase from "~/components/header/header-base"
import HeaderUserButton from "~/components/header/header-user-button"

export default function AdminHeader() {
    return (
        <>
            <HeaderBase>
                <div className="flex gap-1 md:gap-3 justify-center items-center">
                    <CompanyIconButton></CompanyIconButton>
                </div>
                <div className="grid grid-cols-10 w-full">
                    <span className="col-start-5 text-4xl font-extrabold text-center">Admin</span>
                </div>
                <div className="flex justify-center gap-6 items-center p-2">
                    <HeaderUserButton></HeaderUserButton>
                </div>
            </HeaderBase>
            <nav className="grid grid-flow-col text-center place-content-center gap-5 py-2 bg-neutral-300">
                <Link
                    key="/admin"
                    href="/admin"
                    className="hover:underline"
                >
                    Feedbacks
                </Link>
                <Link
                    key="/admin/orders"
                    href="/admin/orders"
                    className="hover:underline"
                >
                    Pedidos
                </Link>
                <Link
                    href="/admin/book"
                    className="hover:underline"
                >
                    Livros
                </Link>

                <Link
                    href="/admin/author"
                    className="hover:underline"
                >
                    Autores
                </Link>

                <Link
                    href="/admin/translator"
                    className="hover:underline"
                >
                    Tradutores
                </Link>

                <Link
                    href="/admin/publisher"
                    className="hover:underline"
                >
                    Editoras
                </Link>

                <Link
                    href="/admin/series"
                    className="hover:underline"
                >
                    Séries
                </Link>

                <Link
                    href="/admin/category"
                    className="hover:underline"
                >
                    Categorias
                </Link>

                <Link
                    href="/admin/super-category"
                    className="hover:underline"
                >
                    Categorias Mães
                </Link>
            </nav>
        </>
    )
}

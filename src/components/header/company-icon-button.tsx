import Link from "next/link"

export default function CompanyIconButton() {
    return (
        <Link href="/commerce">
            <img
                src="favicon.ico"
                alt="Logo da loja"
                className="h-7"
            />
        </Link>
    )
}

import Image from "next/image"
import Link from "next/link"
import { env } from "~/env"

export default function CompanyIconButton() {
    return (
        <Link
            href="/commerce"
            className="flex items-center space-x-2"
        >
            <Image
                src="images/favicon-dark.svg"
                alt="Logo"
                width={50}
                height={50}
            />
            <span className="text-xl font-bold">{env.APP_NAME}</span>
        </Link>
    )
}

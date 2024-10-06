import { BookOpenTextIcon } from "lucide-react"
import Link from "next/link"
import { env } from "~/env"

export default function CompanyIconButton() {
    return (
        <Link
            href="/commerce"
            className="flex items-center space-x-2"
        >
            <BookOpenTextIcon className="h-6 w-6" />
            <span className="text-xl font-bold">{env.APP_NAME}</span>
        </Link>
    )
}

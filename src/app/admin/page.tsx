import { BookOpen } from "lucide-react"
import { Button } from "~/components/ui/button"
import DataTable from "./_components/data-table"
import Link from "next/link"

type OrderStatus =
    | "AWAITING_CONFIRMATION"
    | "CANCELED"
    | "CONFIRMED"
    | "POSTED"
    | "DONE"
    | "REQUESTED_RETURN"
    | "REFUSED_RETURN"
    | "AWAITING_RETURN"
    | "RETURN_DONE"

type Order = {
    id: string
    price: string
    userName: string
    userEmail: string
    status: OrderStatus
    shippingMethod: string
    estimatedDeliveryDate: string
    createdAt: Date
    updatedAt: Date
    books: string[]
}

export default async function Admin({
    searchParams,
}: {
    searchParams: {
        page?: string
        take?: string
    }
}) {
    const currentPage = Number(searchParams.page) || 1

    const currentTake = Number(searchParams.take) || 10

    const orders: Order[] = [
        {
            id: "1",
            price: "R$ 29.99",
            userName: "John Doe",
            userEmail: "john@example.com",
            status: "AWAITING_CONFIRMATION",
            shippingMethod: "Standard",
            estimatedDeliveryDate: "2023-07-15",
            createdAt: new Date("2023-07-01T10:00:00"),
            updatedAt: new Date("2023-07-01T10:00:00"),
            books: ["The Great Gatsby"],
        },
        {
            id: "2",
            price: "R$ 29.99",
            userName: "Jane Smith",
            userEmail: "jane@example.com",
            status: "CONFIRMED",
            shippingMethod: "Express",
            estimatedDeliveryDate: "2023-07-10",
            createdAt: new Date("2023-07-02T14:30:00"),
            updatedAt: new Date("2023-07-02T15:00:00"),
            books: ["To Kill a Mockingbird", "1984"],
        },
        {
            id: "3",
            price: "R$ 29.99",
            userName: "Bob Johnson",
            userEmail: "bob@example.com",
            status: "POSTED",
            shippingMethod: "Standard",
            estimatedDeliveryDate: "2023-07-18",
            createdAt: new Date("2023-06-30T09:15:00"),
            updatedAt: new Date("2023-07-01T11:30:00"),
            books: ["1984"],
        },
        {
            id: "4",
            price: "R$ 29.99",
            userName: "Alice Brown",
            userEmail: "alice@example.com",
            status: "DONE",
            shippingMethod: "Express",
            estimatedDeliveryDate: "2023-07-05",
            createdAt: new Date("2023-06-28T16:45:00"),
            updatedAt: new Date("2023-07-05T09:00:00"),
            books: ["The Great Gatsby", "Pride and Prejudice"],
        },
        {
            id: "5",
            price: "R$ 29.99",
            userName: "Charlie Wilson",
            userEmail: "charlie@example.com",
            status: "REQUESTED_RETURN",
            shippingMethod: "Standard",
            estimatedDeliveryDate: "2023-07-20",
            createdAt: new Date("2023-07-03T11:20:00"),
            updatedAt: new Date("2023-07-06T14:15:00"),
            books: ["To Kill a Mockingbird"],
        },
    ]

    return (
        <div className="container flex flex-col gap-5 py-5">
            <Link
                href={"/admin/tables"}
                className="hover:underline"
            >
                <div className="flex flex-row items-center justify-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Modify Database Data
                </div>
            </Link>
            <DataTable
                name="pedido"
                namePlural="pedidos"
                tableHeaders={{
                    id: "ID",
                    price: "Preço",
                    userName: "Nome do usuário",
                    status: "Status",
                    shippingMethod: "Serviço de entrega",
                    estimatedDeliveryDate: "Data de entrega (estimada)",
                    createdAt: "Data de criação",
                    updatedAt: "Data da última atualização",
                    books: "Livros comprados",
                }}
                tableDescription={`Crie, atualize, apague ou busque pedidos.`}
                rows={orders}
                isError={false}
                isSuccess={true}
                isLoading={false}
                pagination={{
                    urlPageParamName: "page",
                    total: orders.length,
                    page: currentPage,
                    take: currentTake,
                }}
            ></DataTable>
        </div>
    )
}

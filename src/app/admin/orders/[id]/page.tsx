import Image from "next/image"
import Link from "next/link"
import OrderStatus from "~/components/order/order-status"
import { authClient } from "~/server/auth-api"
import { db } from "~/server/db"

export default async function OrderDetails({ params: { id } }: { params: { id: string } }) {
    const order = await db.order.findUnique({
        where: {
            id,
        },
        include: {
            BookOnOrder: {
                include: {
                    Book: {
                        include: {
                            DisplayImage: {
                                select: {
                                    id: true,
                                    url: true,
                                },
                                orderBy: {
                                    order: "asc",
                                },
                                take: 1,
                            },
                            AuthorOnBook: {
                                orderBy: {
                                    order: "asc",
                                },
                                include: {
                                    Author: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                                take: 1,
                            },
                            CategoryOnBook: {
                                orderBy: {
                                    order: "asc",
                                },
                                include: {
                                    Category: {
                                        include: {
                                            SuperCategory: true,
                                        },
                                    },
                                },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    })

    if (!order) {
        return <p>Pedido não encontrado.</p>
    }

    const userData = await authClient.users.getUser(order.userId)

    if (!userData) {
        return <p>Dados de usuário não foram encontrados.</p>
    }

    return (
        <div className="flex flex-col gap-2 items-center justify-center p-5 text-lg">
            <h1 className="font-bold text-3xl p-5 text-center">
                Pedido com ID: <span className="font-light">{order.id}</span>
            </h1>
            <div className="flex gap-1 items-center justify-center">
                <span className="font-bold">Status do pedido: </span>
                <OrderStatus status={order.status}></OrderStatus>
            </div>
            <p className="font-bold">
                Email do usuário: <span className="font-light">{userData.primaryEmailAddress?.emailAddress ?? "N/A"}</span>
            </p>
            <p className="font-bold">
                Última atulização: <span className="font-light">{order.updatedAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
            </p>
            {order.paymentId && (
                <a
                    className="hover:underline text-nowrap"
                    href={`https://dashboard.stripe.com/test/payments/${order.paymentId}`}
                >
                    Ver no Stripe
                </a>
            )}
            {order.printUrl && (
                <a
                    className="hover:underline"
                    href={order.printUrl}
                >
                    Ver PDF do Ticket
                </a>
            )}
            <h2 className="font-bold text-3xl p-5">Livros Comprados</h2>
            <div className={`grid grid-cols-${Math.min(order.BookOnOrder.length, 4)} gap-5`}>
                {order.BookOnOrder.map((bo) => (
                    <div
                        key={bo.bookId}
                        className="flex flex-col gap-2 items-start justify-center border-2 border-black rounded-lg p-5 font-bold max-w-md"
                    >
                        <Image
                            src={bo.Book.DisplayImage[0]?.url ?? ""}
                            alt="capa do livro"
                            className="object-cover self-center mb-2"
                            width={200}
                            height={200}
                        ></Image>
                        <Link
                            className="hover:underline text-nowrap font-normal self-center"
                            href={`/admin/book?search=IDS-->${bo.Book.id}`}
                        >
                            Ver detalhes
                        </Link>
                        <p>
                            ID: <span className="font-light">{bo.Book.id}</span>
                        </p>
                        <p>
                            Título: <span className="font-light">{bo.Book.title}</span>
                        </p>
                        <p>
                            Autor: <span className="font-light">{bo.Book.AuthorOnBook[0]?.Author.name ?? "N/A"}</span>
                        </p>
                        <p>
                            Categoria: <span className="font-light">{bo.Book.CategoryOnBook[0]?.Category.SuperCategory?.name ?? "N/A"}</span>
                        </p>
                        <p>
                            Subcategoria: <span className="font-light">{bo.Book.CategoryOnBook[0]?.Category?.name ?? "N/A"}</span>
                        </p>
                        <p>
                            Quantidade: <span className="font-light">{bo.amount}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

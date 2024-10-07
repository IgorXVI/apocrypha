import { auth } from "@clerk/nextjs/server"
import { db } from "~/server/db"

export default async function UserOrdersPage() {
    const user = auth()

    if (!user.userId) {
        return <p>Unauthorized</p>
    }

    const orders = await db.order.findMany({
        where: {
            userId: user.userId,
        },
        include: {
            BookOnOrder: {
                include: {
                    Book: {
                        select: {
                            title: true,
                        },
                    },
                },
            },
        },
    })

    if (!orders.length) {
        return <p>Nenhum pedido encontrado.</p>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {orders.map((order) => (
                <div key={order.id}>
                    <p>Status: {order.status}</p>
                    <p>Custo: R$ {order.totalPrice.toFixed(2)}</p>
                    <p>Livros:</p>
                    <section>
                        {order.BookOnOrder.map((bo) => (
                            <article key={bo.bookId}>
                                <p>Título: {bo.Book.title}</p>
                                <p>Preço: R$ {bo.price.toFixed(2)}</p>
                            </article>
                        ))}
                    </section>
                </div>
            ))}
        </div>
    )
}

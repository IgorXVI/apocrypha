import { auth } from "@clerk/nextjs/server"
import { db } from "~/server/db"

export default async function UserOrder({ params: { id } }: { params: { id: string } }) {
    const user = auth()

    if (!user.userId) {
        return <p>Unauthorized</p>
    }

    const order = await db.order.findUnique({
        where: {
            id,
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

    if (!order) {
        return <p>Pedido não foi encontrado.</p>
    }

    return (
        <div className="container mx-auto px-4 py-8">
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
    )
}

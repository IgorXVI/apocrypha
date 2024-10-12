import { redirect } from "next/navigation"

export default async function PaymentCanceled(_: { params: { sessionId: string } }) {
    redirect("/commerce/cart")
}

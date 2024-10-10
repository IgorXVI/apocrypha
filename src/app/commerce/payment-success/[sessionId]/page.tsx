import { redirect } from "next/navigation"

export default async function PaymentSuccess(_: { params: { sessionId: string } }) {
    redirect("/commerce/user/order")
}

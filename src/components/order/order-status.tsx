import { type $Enums } from "prisma/prisma-client"

const orderStatusStyle = new Map<$Enums.OrderStatus, string>([
    ["DELIVERED", "bg-green-500"],
    ["CANCELED", "bg-red-500"],
    ["IN_TRANSIT", "bg-blue-500"],
    ["PREPARING", "bg-neutral-500"],
    ["REFUND_REQUESTED", "bg-blue-700"],
    ["REFUND_ACCEPTED", "bg-green-700"],
    ["REFUND_DENIED", "bg-red-700"],
])

const orderStatusLabel = new Map<$Enums.OrderStatus, string>([
    ["DELIVERED", "Entregue"],
    ["CANCELED", "Cancelado"],
    ["IN_TRANSIT", "A caminho"],
    ["PREPARING", "Preparando"],
    ["REFUND_REQUESTED", "Reembolso sendo avaliado"],
    ["REFUND_ACCEPTED", "Reembolso foi feito"],
    ["REFUND_DENIED", "Reembolso foi recusado"],
])

export default function OrderStatus({ status }: { status: $Enums.OrderStatus }) {
    return (
        <span className={`p-2 text-white rounded font-bold ${orderStatusStyle.get(status) ?? "bg-black"}`}>
            {orderStatusLabel.get(status) ?? status}
        </span>
    )
}

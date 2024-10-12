import { CheckCircleIcon, PackageIcon, TruckIcon, XCircleIcon } from "lucide-react"
import { type $Enums } from "prisma/prisma-client"

const orderStatusStyle = new Map<$Enums.OrderStatus, string>([
    ["DELIVERED", "bg-green-500"],
    ["CANCELED", "bg-red-500"],
    ["IN_TRANSIT", "bg-teal-500"],
    ["PREPARING", "bg-neutral-500"],
    ["REFUND_REQUESTED", "bg-teal-700"],
    ["REFUND_ACCEPTED", "bg-green-700"],
    ["REFUND_DENIED", "bg-red-700"],
])

const orderStatusLabel = new Map<$Enums.OrderStatus, React.ReactNode>([
    [
        "DELIVERED",
        <div className="flex flex-row items-center justify-center gap-2">
            <CheckCircleIcon></CheckCircleIcon>
            <span>Entregue</span>
        </div>,
    ],
    [
        "CANCELED",
        <div className="flex flex-row items-center justify-center gap-2">
            <XCircleIcon></XCircleIcon>
            <span>Cancelado</span>
        </div>,
    ],
    [
        "IN_TRANSIT",
        <div className="flex flex-row items-center justify-center gap-2">
            <TruckIcon></TruckIcon>
            <span>A caminho</span>
        </div>,
    ],
    [
        "PREPARING",
        <div className="flex flex-row items-center justify-center gap-2">
            <PackageIcon></PackageIcon>
            <span>Preparando</span>
        </div>,
    ],
    ["REFUND_REQUESTED", "Reembolso sendo avaliado"],
    ["REFUND_ACCEPTED", "Reembolso foi feito"],
    ["REFUND_DENIED", "Reembolso foi recusado"],
])

export default function OrderStatus({ status }: { status: $Enums.OrderStatus }) {
    return (
        <div className={`max-w-[150px] p-2 text-white rounded-lg shadow-sm shadow-black font-bold ${orderStatusStyle.get(status) ?? "bg-black"}`}>
            {orderStatusLabel.get(status) ?? status}
        </div>
    )
}

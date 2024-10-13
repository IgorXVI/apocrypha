import { CheckCircleIcon, PackageIcon, TruckIcon, XCircleIcon } from "lucide-react"
import { type $Enums } from "prisma/prisma-client"
import { cn } from "~/lib/utils"

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
        <div
            key={"DELIVERED"}
            className="flex flex-row items-center justify-center gap-2"
        >
            <CheckCircleIcon></CheckCircleIcon>
            <span className="text-nowrap">Entregue</span>
        </div>,
    ],
    [
        "CANCELED",
        <div
            key={"CANCELED"}
            className="flex flex-row items-center justify-center gap-2"
        >
            <XCircleIcon></XCircleIcon>
            <span className="text-nowrap">Cancelado</span>
        </div>,
    ],
    [
        "IN_TRANSIT",
        <div
            key={"IN_TRANSIT"}
            className="flex flex-row items-center justify-center gap-2"
        >
            <TruckIcon></TruckIcon>
            <span className="text-nowrap">A caminho</span>
        </div>,
    ],
    [
        "PREPARING",
        <div
            key={"PREPARING"}
            className="flex flex-row items-center justify-center gap-2"
        >
            <PackageIcon></PackageIcon>
            <span className="text-nowrap">Preparando</span>
        </div>,
    ],
    ["REFUND_REQUESTED", "Reembolso sendo avaliado"],
    ["REFUND_ACCEPTED", "Reembolso foi feito"],
    ["REFUND_DENIED", "Reembolso foi recusado"],
])

export default function OrderStatus({ status, className = "" }: { status: $Enums.OrderStatus; className?: string }) {
    return (
        <div className={cn(`p-2 text-white rounded-lg font-bold ${orderStatusStyle.get(status) ?? "bg-black"}`, className)}>
            {orderStatusLabel.get(status) ?? status}
        </div>
    )
}

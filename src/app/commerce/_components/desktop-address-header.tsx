import { MapPin } from "lucide-react"

export default function DesktopAddressHeader() {
    return (
        <div className="hidden md:flex items-center rounded gap-1 ml-5">
            <MapPin className="h-7 w-7"></MapPin>
            <span className="font-bold text-sm ml-2">
                Olá Selecione <br /> o endereço
            </span>
        </div>
    )
}

import { MapPin } from "lucide-react"

export default function MobileAddressHeader() {
    return (
        <div className="flex md:hidden bg-slate-600 text-sm items-center gap-10 p-2 md:px-10 w-full">
            <div className="flex items-center rounded gap-1">
                <MapPin className="h-6 w-6"></MapPin>
                <div className="flex leading-tight text-xs">
                    <span>Olá</span>
                    <span className="font-bold pl-1">Selecione o endereço</span>
                </div>
            </div>
        </div>
    )
}

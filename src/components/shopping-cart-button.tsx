import { ShoppingCart } from "lucide-react"

export default function ShoppingCartButton() {
    return (
        <div className="rounded-sm relative">
            <ShoppingCart className="h-7 w-7"></ShoppingCart>
            <span className=" text-white absolute -top-1 left-5 text-center w-5 h-5 text-sm bg-slate-600 rounded-full">
                0
            </span>
        </div>
    )
}

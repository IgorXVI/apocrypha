import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"
import { Input } from "~/components/ui/input"
import { updatePrice } from "~/server/actions/book"

export default function BookPriceUpdate({ id, DBValue }: { id: string; DBValue: number }) {
    const handleInput = useDebouncedCallback((event) => {
        const target = event.target as HTMLInputElement

        toastLoading("Atualizando preço do livro...", "book-price-update")
        updatePrice(id, Number(target.value) ?? 0)
            .then((result) => {
                toast.dismiss("book-price-update")
                if (!result.success) {
                    toastError(result.errorMessage)
                    return
                }

                toastSuccess("Atualização bem sucedida.")
            })
            .catch((error) => {
                toast.dismiss("book-price-update")
                toastError(error)
            })
    }, 1000)

    return (
        <div className="flex flex-row flex-nowrap gap-2 items-center justify-center">
            <span>R$</span>
            <Input
                className="min-w-[65px]"
                defaultValue={DBValue}
                onInput={handleInput}
            ></Input>
        </div>
    )
}

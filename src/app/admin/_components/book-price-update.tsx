import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"
import { Input } from "~/components/ui/input"
import { updatePrice } from "~/server/actions/book"

export default function BookPriceUpdate({ id, DBValue, revalidateCache }: { id: string; DBValue: number; revalidateCache: () => Promise<unknown> }) {
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
            .then(() => revalidateCache())
            .catch((error) => {
                toast.dismiss("book-price-update")
                toastError(error)
            })
    }, 2000)

    return (
        <div className="flex flex-row flex-nowrap gap-2 items-center justify-center">
            <span>R$</span>
            <Input
                className="min-w-[75px]"
                defaultValue={DBValue}
                onInput={handleInput}
            ></Input>
        </div>
    )
}

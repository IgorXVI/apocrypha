import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"
import { Input } from "~/components/ui/input"
import { updateStock } from "~/server/actions/book"

export default function BookStockUpdate({ id, DBValue, revalidateCache }: { id: string; DBValue: number; revalidateCache: () => Promise<unknown> }) {
    const handleInput = useDebouncedCallback((event) => {
        const target = event.target as HTMLInputElement

        toastLoading("Atualizando estoque do livro...", "book-stock-update")
        updateStock(id, Number(target.value) ?? 0)
            .then((result) => {
                toast.dismiss("book-stock-update")
                if (!result.success) {
                    toastError(result.errorMessage)
                    return
                }

                toastSuccess("Atualização bem sucedida.")
            })
            .then(() => revalidateCache())
            .catch((error) => {
                toast.dismiss("book-stock-update")
                toastError(error)
            })
    }, 2000)

    return (
        <Input
            className="min-w-[65px]"
            defaultValue={DBValue}
            onInput={handleInput}
        ></Input>
    )
}

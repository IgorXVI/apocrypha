import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"
import { toastError, toastLoading, toastSuccess } from "~/components/toast/toasting"
import { Input } from "~/components/ui/input"
import { updateStock } from "~/server/actions/book"

export default function BookStockUpdate({ id, DBValue }: { id: string; DBValue: number }) {
    const handleInput = useDebouncedCallback((event) => {
        const target = event.target as HTMLInputElement

        toastLoading("Atualizando estoque do livro...", "book-stock-update")
        updateStock(id, Number(target.value))
            .then((result) => {
                toast.dismiss("book-stock-update")
                if (!result.success) {
                    toastError(result.errorMessage)
                    return
                }

                toastSuccess("Atualização bem sucedida.")
            })
            .catch((error) => {
                toast.dismiss("book-stock-update")
                toastError(error)
            })
    }, 1000)

    return (
        <Input
            defaultValue={DBValue}
            onInput={handleInput}
        ></Input>
    )
}

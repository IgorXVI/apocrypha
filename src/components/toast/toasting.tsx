import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"
import { type CommonDBReturn } from "~/lib/types"

export const toastError = (error: unknown) => {
    const errorStr =
        error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : !error
                ? "Erro desconhecido"
                : typeof error === "object" &&
                    "data" in error &&
                    typeof error.data == "object" &&
                    error.data &&
                    "errorMessage" in error.data &&
                    typeof error.data.errorMessage === "string"
                  ? error.data.errorMessage
                  : JSON.stringify(error)

    toast(<span className="text-lg text-red-500">{errorStr}</span>)
}

export const toastSuccess = (successMessage: string) => toast(<span className="text-lg text-green-500">{successMessage}</span>)

export const toastLoading = (loadingMessage: string, id: string) => {
    toast(
        <div className="flex flex-row items-center gap-4">
            <LoaderCircle className="animate-spin"></LoaderCircle>
            <span className="text-lg">{loadingMessage}</span>
        </div>,
        {
            duration: 100000,
            id,
        },
    )
}

export async function dbQueryWithToast<T>({
    dbQuery,
    mutationName,
    waitingMessage,
    successMessage,
}: {
    dbQuery: () => Promise<CommonDBReturn<T>>
    mutationName: string
    waitingMessage: string
    successMessage: string
}) {
    const beginDBCallId = `${mutationName}-begin`

    toastLoading(waitingMessage, beginDBCallId)

    try {
        const result = await dbQuery()

        toast.dismiss(beginDBCallId)

        if (!result.success) {
            toastError(result.errorMessage)
            return
        }

        toastSuccess(successMessage)

        return result.data
    } catch (error) {
        toast.dismiss(beginDBCallId)
        toastError(error)
    }
}

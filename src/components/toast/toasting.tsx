import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"
import { type CommonDBReturn } from "~/lib/types"

export const toastError = (errorMessage: string) => {
    toast(<span className="text-lg text-red-500">{errorMessage}</span>, {
        duration: 5000,
    })
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

    toast(
        <div className="flex flex-row items-center gap-4">
            <LoaderCircle className="animate-spin"></LoaderCircle>
            <span className="text-lg">{waitingMessage}</span>
        </div>,
        {
            duration: 100000,
            id: beginDBCallId,
        },
    )

    try {
        const result = await dbQuery()

        toast.dismiss(beginDBCallId)

        if (!result.success) {
            toast(<span className="text-lg text-red-500">Erro retornado do servidor: {result.errorMessage}</span>, {
                duration: 5000,
            })
            return
        }

        toast(<span className="text-lg text-green-500">{successMessage}</span>)

        return result.data
    } catch (error) {
        toast.dismiss(beginDBCallId)
        toast(<span className="text-lg text-red-500">Erro ao tentar chamar o servidor: {(error as Error).message}</span>, {
            duration: 5000,
        })
    }
}

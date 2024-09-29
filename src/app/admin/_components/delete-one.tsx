"use client"

import { useState } from "react"
import { dbQueryWithToast } from "~/components/toast/toasting"
import { Button } from "~/components/ui/button"
import { mainApi } from "~/lib/redux/apis/main-api/main"

export default function DeleteOne(props: {
    id: string
    slug: string
    onConfirm: () => void
    waitingMessage: string
    successMessage: string
    refetchParentQuery?: () => Promise<unknown>
}) {
    const [inputDisabled, setInputDisabled] = useState(false)
    const [triggerDeleteOne] = mainApi.useDeleteOneMutation()

    const clickedYes = async () => {
        setInputDisabled(true)

        await dbQueryWithToast({
            dbQuery: () =>
                triggerDeleteOne({ id: props.id, slug: props.slug })
                    .then((result) => {
                        if (result.error) {
                            throw new Error(result.error as string)
                        }

                        if (!result.data.success) {
                            throw new Error(result.data.errorMessage)
                        }

                        return {
                            data: undefined,
                            success: result.data.success,
                            errorMessage: "",
                        }
                    })
                    .then((prevResult) => {
                        if (props.refetchParentQuery) {
                            return props.refetchParentQuery().then(() => prevResult)
                        }

                        return prevResult
                    })
                    .catch((error) => ({
                        data: undefined,
                        success: false,
                        errorMessage: (error as Error).message,
                    })),
            mutationName: "deleting",
            successMessage: props.successMessage,
            waitingMessage: props.waitingMessage,
        })

        props.onConfirm()
    }

    return (
        <div className="flex flex-col items-center gap-10 justify-center p-5">
            <h1 className="text-4xl text-center font-extrabold">Tem certeza que quer apagar?</h1>
            <Button
                disabled={inputDisabled}
                onClick={clickedYes}
                variant="destructive"
                className="text-4xl p-7"
            >
                Sim
            </Button>
        </div>
    )
}

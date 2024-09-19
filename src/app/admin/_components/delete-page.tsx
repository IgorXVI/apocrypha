"use client"

import { useState } from "react"
import { dbQueryWithToast } from "~/lib/toasting"
import { Button } from "~/components/ui/button"

export default function DeleteOne(props: {
    dbMutation: () => Promise<{
        success: boolean
        errorMessage: string
        data: undefined
    }>
}) {
    const [inputDisabled, setInputDisabled] = useState(false)

    const clickedYes = () => {
        setInputDisabled(true)

        return dbQueryWithToast({
            dbQuery: props.dbMutation,
            mutationName: "currency-delete",
            successMessage: "Moeda Apagada",
            waitingMessage: "Apagando moeda...",
        })
    }

    return (
        <div className="flex flex-col items-center gap-10 justify-center p-5">
            <h1 className="text-4xl text-center font-extrabold">
                Tem certeza que quer apagar?
            </h1>
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

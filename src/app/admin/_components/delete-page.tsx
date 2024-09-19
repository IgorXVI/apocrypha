"use client"

import { useState } from "react"
import { dbQueryWithToast } from "~/lib/toasting"
import { Button } from "~/components/ui/button"

export default function DeleteOne(props: {
    name: string
    dbMutation: () => Promise<{
        success: boolean
        errorMessage: string
        data: undefined
    }>
    onConfirm: () => void
}) {
    const [inputDisabled, setInputDisabled] = useState(false)

    const clickedYes = () => {
        setInputDisabled(true)

        return dbQueryWithToast({
            dbQuery: props.dbMutation,
            mutationName: "deleting",
            successMessage: `Moeda ${props.name}`,
            waitingMessage: `Apagando ${props.name}...`,
        }).then(() => props.onConfirm())
    }

    return (
        <div className="flex flex-col items-center gap-10 justify-center p-5">
            <h1 className="text-4xl text-center font-extrabold">
                Tem certeza que quer apagar {props.name}?
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

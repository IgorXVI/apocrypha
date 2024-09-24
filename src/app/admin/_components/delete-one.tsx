"use client"

import { useState } from "react"
import { dbQueryWithToast } from "./toasting"
import { Button } from "~/components/ui/button"

export default function DeleteOne(props: { id: string; slug: string; onConfirm: () => void; waitingMessage: string; successMessage: string }) {
    const [inputDisabled, setInputDisabled] = useState(false)

    const clickedYes = () => {
        setInputDisabled(true)

        return dbQueryWithToast({
            dbQuery: () =>
                fetch(`/api/admin/${props.slug}/${props.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then((res) => res.json())
                    .then((json) => {
                        if (json.success) {
                            return {
                                data: undefined,
                                success: true,
                                errorMessage: "",
                            }
                        }

                        throw new Error(json.errorMessage)
                    })
                    .catch((error) => {
                        return {
                            data: undefined,
                            success: false,
                            errorMessage: (error as Error).message,
                        }
                    }),
            mutationName: "deleting",
            successMessage: props.successMessage,
            waitingMessage: props.waitingMessage,
        }).then(() => props.onConfirm())
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

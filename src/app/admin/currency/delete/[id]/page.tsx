"use client"

import { deleteCurrency } from "~/server/queries"
import DeletePage from "~/app/admin/_components/delete-page"

export default function DeleteCurrency({
    params: { id },
}: {
    params: { id: string }
}) {
    return (
        <DeletePage
            dbMutation={() => deleteCurrency(id)}
            idForQuestion={`Moeda com id ${id}`}
        ></DeletePage>
    )
}

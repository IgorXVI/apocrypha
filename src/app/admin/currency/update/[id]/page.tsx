"use client"

import { getOneCurrency, updateCurrency } from "~/server/queries"
import CreateOrUpdate from "~/components/admin/create-or-update"
import { defaultValues, zodValidationSchema, inputKeyMap } from "../../config"

export default function UpdateCurrency({
    params: { id },
}: {
    params: { id: string }
}) {
    return (
        <CreateOrUpdate
            title="Atualizar Moeda"
            mutationName="currency-update"
            waitingMessage="Atualizando moeda..."
            successMessage="Moeda atualizada"
            dbMutation={(values) => updateCurrency(id, values)}
            dbGetOne={() => getOneCurrency(id)}
            defaultValues={defaultValues}
            formSchema={zodValidationSchema}
            inputKeyMap={inputKeyMap}
        ></CreateOrUpdate>
    )
}

"use client"

import { createCurrency } from "~/server/queries"
import CreateOrUpdate from "~/components/admin/create-or-update"
import { defaultValues, inputKeyMap, zodValidationSchema } from "../config"

export default function CreateCurrency() {
    return (
        <CreateOrUpdate
            title="Criar Moeda"
            mutationName="currency-create"
            waitingMessage="Criando moeda..."
            successMessage="Moeda criada"
            dbMutation={createCurrency}
            defaultValues={defaultValues}
            formSchema={zodValidationSchema}
            inputKeyMap={inputKeyMap}
        ></CreateOrUpdate>
    )
}

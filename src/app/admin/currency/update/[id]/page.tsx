"use client"

import { z } from "zod"

import { Input } from "~/components/ui/input"
import { getOneCurrency, updateCurrency } from "~/server/queries"
import CreateOrUpdate from "~/components/admin/create-or-update"

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
            defaultValues={{
                label: "",
                iso4217Code: "",
            }}
            formSchema={z.object({
                label: z
                    .string()
                    .min(1, {
                        message: "Prefixo deve ter ao menos 1 caracter.",
                    })
                    .max(5, {
                        message: "Prefixo deve ter no máximo 5 caracteres.",
                    }),
                iso4217Code: z
                    .string()
                    .min(3, {
                        message:
                            "Código ISO 4217 deve ter ao menos 3 caracteres.",
                    })
                    .max(4, {
                        message:
                            "Código ISO 4217 deve ter no máximo 4 caracteres.",
                    }),
            })}
            inputKeyMap={{
                label: {
                    node: (field) => <Input placeholder="$" {...field} />,
                    label: "Prefixo",
                    description:
                        "Esse é o préfixo que vai aparecer antes do valor monetário.",
                },
                iso4217Code: {
                    node: (field) => <Input placeholder="EUR" {...field} />,
                    label: "Código ISO 4217",
                    description: (
                        <>
                            Esse é o código
                            <a
                                href="https://pt.wikipedia.org/wiki/ISO_4217"
                                className="underline mr-1 ml-1"
                            >
                                ISO 4217
                            </a>
                            da moeda.
                        </>
                    ),
                },
            }}
        ></CreateOrUpdate>
    )
}

import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { currencyAdminQueries } from "~/server/queries"

const zodValidationSchema = z.object({
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
            message: "Código ISO 4217 deve ter ao menos 3 caracteres.",
        })
        .max(4, {
            message: "Código ISO 4217 deve ter no máximo 4 caracteres.",
        }),
})

type SchemaType = z.infer<typeof zodValidationSchema>

const defaultValues: SchemaType = {
    label: "",
    iso4217Code: "",
}

type ModelAttrs = keyof SchemaType

const inputKeyMap: Record<
    ModelAttrs,
    {
        node: (
            field: ControllerRenderProps<FieldValues, ModelAttrs>,
        ) => React.ReactNode
        label: string
        description: string | React.ReactNode
    }
> = {
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
}

export const searchPageProps = {
    title: "Moedas",
    description: "Crie, atualize, apague ou busque moedas cadastradas",
    slug: "currency",
    tableHeaders: ["Prefixo", "Código"],
    tableAttrs: ["label", "iso4217Code"] as ModelAttrs[],
    getManyQuery: currencyAdminQueries.getMany,
}

export const deletePageProps = (id: string) => ({
    dbMutation: () => currencyAdminQueries.deleteOne(id),
    idForQuestion: "moeda",
})

export const updatePageProps = (id: string) => ({
    title: "Atualizar Moeda",
    mutationName: "currency-update",
    waitingMessage: "Atualizando moeda...",
    successMessage: "Moeda atualizada",
    dbMutation: (data: SchemaType) => currencyAdminQueries.updateOne(id, data),
    dbGetOne: () => currencyAdminQueries.getOne(id),
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
})

export const createPageProps = {
    title: "Criar Moeda",
    mutationName: "currency-create",
    waitingMessage: "Criando moeda...",
    successMessage: "Moeda criada",
    dbMutation: currencyAdminQueries.createOne,
    defaultValues,
    formSchema: zodValidationSchema,
    inputKeyMap,
}

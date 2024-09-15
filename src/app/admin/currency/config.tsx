import { z } from "zod"
import { type ControllerRenderProps, type FieldValues } from "react-hook-form"

import { Input } from "~/components/ui/input"

export const zodValidationSchema = z.object({
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

export const defaultValues = {
    label: "",
    iso4217Code: "",
}

type NodeFieldType = ControllerRenderProps<FieldValues, "label" | "iso4217Code">

export const inputKeyMap = {
    label: {
        node: (field: NodeFieldType) => <Input placeholder="$" {...field} />,
        label: "Prefixo",
        description:
            "Esse é o préfixo que vai aparecer antes do valor monetário.",
    },
    iso4217Code: {
        node: (field: NodeFieldType) => <Input placeholder="EUR" {...field} />,
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

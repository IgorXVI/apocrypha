import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

import { db } from "~/server/db"
import { errorHandler } from "~/server/generic-queries"

const userAddressValidationSchema = z.object({
    cep: z
        .string()
        .min(8, {
            message: "CEP deve ter no mínimo 8 dígitos.",
        })
        .max(8, {
            message: "CEP deve ter no máximo 8 dígitos.",
        })
        .transform((cepStr) => Number(cepStr))
        .pipe(
            z
                .number({
                    message: "CEP deve ser um número válido",
                })
                .transform((cepNum) => cepNum.toString()),
        )
        .default(""),
    state: z
        .string()
        .min(2, {
            message: "UF deve ter no mínimo 2 letras.",
        })
        .max(2, {
            message: "UF deve ter no máximo 2 letras.",
        })
        .default(""),
    city: z
        .string()
        .min(2, {
            message: "Cidade deve ter no mínimo 2 letras.",
        })
        .default(""),
    neighborhood: z
        .string()
        .min(2, {
            message: "Bairro deve ter no mínimo 2 letras.",
        })
        .default(""),
    street: z
        .string()
        .min(2, {
            message: "Rua deve ter no mínimo 2 letras.",
        })
        .default(""),
    number: z.number().int().positive({ message: "Número deve ser positivo." }).default(0),
    complement: z
        .string()
        .min(2, {
            message: "Complemento deve ter no mínimo 2 letras.",
        })
        .optional(),
})

type UserAdressSchema = z.infer<typeof userAddressValidationSchema>

export type POSTApiUserAddressInput = {
    data: UserAdressSchema
}

export type POSTApiUserAddressOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
          issues?: z.ZodIssue[]
      }

export async function POST(req: Request) {
    const user = auth()

    if (!user.userId) {
        return Response.json(
            {
                success: false,
                errorMessage: "Unauthorized",
            },
            {
                status: 401,
            },
        )
    }

    const reqBodyResult = await req
        .json()
        .then((data) => {
            return {
                success: true,
                data,
                errorMessage: "",
            }
        })
        .catch((error) => {
            return {
                success: false,
                data: undefined,
                errorMessage: (error as Error).message,
            }
        })

    if (!reqBodyResult.success) {
        return Response.json(
            {
                success: false,
                errorMessage: reqBodyResult.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    const validationResult = userAddressValidationSchema.safeParse(reqBodyResult.data)

    if (!validationResult.success) {
        return Response.json(
            {
                success: false,
                errorMessage: validationResult.error.issues[0]?.message ?? "Validation failed",
                issues: validationResult.error.issues,
            },
            {
                status: 400,
            },
        )
    }

    const requestData = reqBodyResult.data as UserAdressSchema

    const dataForDB = {
        cep: requestData.cep,
        state: requestData.state,
        city: requestData.city,
        neighborhood: requestData.neighborhood,
        street: requestData.street,
        number: requestData.number,
        userId: user.userId,
    }

    const result = await errorHandler(() =>
        db.address.upsert({
            where: {
                userId: user.userId,
            },
            create: dataForDB,
            update: dataForDB,
        }),
    )

    if (!result.success) {
        return Response.json(
            {
                success: false,
                errorMessage: result.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json({
        success: true,
    })
}

export type GETApiUserAddressOutput =
    | {
          success: true
          data: UserAdressSchema
      }
    | {
          success: false
          errorMessage: string
      }

export async function GET() {
    const user = auth()

    if (!user.userId) {
        return Response.json(
            {
                success: false,
                errorMessage: "Unauthorized",
            },
            {
                status: 401,
            },
        )
    }

    const result = await errorHandler(() =>
        db.address.findUniqueOrThrow({
            where: {
                userId: user.userId,
            },
        }),
    )

    if (!result.success) {
        return Response.json(
            {
                success: false,
                errorMessage: result.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json({
        success: true,
        data: result.data,
    })
}

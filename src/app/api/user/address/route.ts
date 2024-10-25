import { auth } from "@clerk/nextjs/server"
import { type z } from "zod"
import { env } from "~/env"
import { type CepResponse } from "~/lib/types"
import { userAddressValidationSchema, type UserAddressSchemaType } from "~/lib/validation"

import { db } from "~/server/db"
import { errorHandler } from "~/server/generic-queries"

export type POSTApiUserAddressInput = {
    data: UserAddressSchemaType
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

    const requestData = reqBodyResult.data as UserAddressSchemaType

    const cepResponse: CepResponse | undefined = await fetch(`${env.BRASIL_API}/cep/v1/${requestData.cep}`)
        .then((res) => res.json())
        .then((json) => {
            if (json.errors) {
                console.error("CEP_API_ERROR", JSON.stringify(json.errors, null, 2))
                return undefined
            }
            return json
        })
        .catch((error) => {
            console.error("CEP_API_ERROR", error)
            return undefined
        })

    if (!cepResponse) {
        return Response.json(
            {
                success: false,
                errorMessage: "CEP is invalid.",
            },
            {
                status: 400,
            },
        )
    }

    const dataForDB = {
        cep: requestData.cep,
        state: cepResponse.state,
        city: cepResponse.city,
        neighborhood: cepResponse.neighborhood,
        street: cepResponse.street,
        number: requestData.number,
        userId: user.userId,
        complement: requestData.complement,
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
          data: {
              number: number
              cep: string
              state: string
              city: string
              neighborhood: string
              street: string
              complement?: string | undefined
          } | null
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
        db.address.findUnique({
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

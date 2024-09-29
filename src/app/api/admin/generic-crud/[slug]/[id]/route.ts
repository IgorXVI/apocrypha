import { type z } from "zod"
import { decideQueries } from "../../core"

export type GETApiGenericCrudGetOneInput = {
    slug: string
    id: string
}

export type GETApiGenericCrudGetOneOutput =
    | {
          success: true
          data: unknown
      }
    | {
          success: false
          errorMessage: string
      }

export async function GET(_: Request, { params: { slug, id } }: { params: { slug: string; id: string } }) {
    const result = await decideQueries(slug).getOne(id)

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

export type DELETEApiGenericCrudDeleteOneInput = {
    slug: string
    id: string
}

export type DELETEApiGenericCrudDeleteOneOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
      }

export async function DELETE(_: Request, { params: { slug, id } }: { params: { slug: string; id: string } }) {
    const result = await decideQueries(slug).deleteOne(id)

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

export type PATCHApiGenericCrudUpdateOneInput = {
    slug: string
    id: string
    data: unknown
}

export type PATCHApiGenericCrudUpdateOneOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
          issues?: z.ZodIssue[]
      }

export async function PATCH(req: Request, { params: { slug, id } }: { params: { slug: string; id: string } }) {
    const slugger = decideQueries(slug)

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

    const validationResult = slugger.validationSchema.safeParse(reqBodyResult.data)

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await slugger.updateOne(id, validationResult.data as any)

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

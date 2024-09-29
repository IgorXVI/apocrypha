import { type GetManyOutput } from "~/lib/types"
import { decideQueries } from "../core"
import { type z } from "zod"

export type GETApiGenericCrudGetManyInput = {
    slug: string
    searchTerm?: string
    take?: number
    skip?: number
}

export type GETApiGenericCrudGetManyOutput =
    | {
          success: true
          data: GetManyOutput<unknown>
      }
    | {
          success: false
          errorMessage: string
      }

export async function GET(req: Request, { params: { slug } }: { params: { slug: string } }) {
    const queryParams = new URLSearchParams(new URL(req.url).search)

    const result = await decideQueries(slug).getMany({
        searchTerm: queryParams.get("searchTerm") ?? "",
        take: Number(queryParams.get("take")) || 10,
        skip: Number(queryParams.get("skip")) || 0,
    })

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

export type POSTApiGenericCrudCreateOneInput = {
    slug: string
    data: unknown
}

export type POSTApiGenericCrudCreateOneOutput =
    | {
          success: true
      }
    | {
          success: false
          errorMessage: string
          issues?: z.ZodIssue[]
      }

export async function POST(req: Request, { params: { slug } }: { params: { slug: string } }) {
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
    const result = await slugger.createOne(validationResult.data as any)

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

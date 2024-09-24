import { decideQueries } from "../../core"

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

import { decideQueries } from "../../core"

export async function GET(_: Request, { params: { slug, id } }: { params: { slug: string; id: string } }) {
    const result = await decideQueries(slug).getOne(id)

    if (!result.success) {
        return Response.json(
            {
                errorMessage: result.errorMessage,
            },
            {
                status: 400,
            },
        )
    }

    return Response.json(result.data)
}

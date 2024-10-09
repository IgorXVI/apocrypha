import { cronAuthCheck, unauthorizedRes } from "../core"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    const passedAuth = cronAuthCheck(req)

    if (!passedAuth) {
        return unauthorizedRes
    }

    return Response.json({ success: true })
}

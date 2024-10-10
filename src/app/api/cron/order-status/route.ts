import { updateAllOrders } from "~/server/order-queries"
import { cronAuthCheck, unauthorizedRes } from "../core"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    const passedAuth = cronAuthCheck(req)

    if (!passedAuth) {
        return unauthorizedRes
    }

    const result = await updateAllOrders()

    return Response.json(result)
}

import { env } from "~/env"

export const unauthorizedRes = new Response("Unauthorized", {
    status: 401,
})

export const cronAuthCheck = (req: Request) => req.headers.get("authorization") === `Bearer ${env.CRON_SECRET}`

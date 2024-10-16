import { db } from "~/server/db"
import CommerceFooter from "./_components/commerce-footer"
import CommerceHeader from "./_components/commerce-header"
import StoreProvider from "~/components/redux/StoreProvider"
import { auth } from "@clerk/nextjs/server"
import { type BookClientSideState, type UserClientSideState } from "~/lib/types"

export default async function CommerceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = auth()

    if (!user.userId) {
        return <p>Unauthorized</p>
    }

    const userState = await db.userState.findUnique({
        where: {
            userId: user.userId,
        },
    })

    let init: UserClientSideState | undefined
    if (userState) {
        init = {
            bookCart: userState.bookCart.map((item) => item?.valueOf() as BookClientSideState),
            bookFavs: userState.bookFavs.map((item) => item?.valueOf() as BookClientSideState),
        }
    }

    return (
        <StoreProvider initialState={init}>
            <CommerceHeader></CommerceHeader>
            <div className="min-h-[80vh] mb-auto">{children}</div>
            <CommerceFooter></CommerceFooter>
        </StoreProvider>
    )
}

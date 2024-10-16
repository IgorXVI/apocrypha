"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { makeStore, type AppStore } from "~/lib/redux/store"

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>()
    if (!storeRef.current) {
        // Create the store instance the first time this renders

        const isInBrowser = typeof window !== "undefined"

        let bookFavsPreloaded: BookCartState[] = []
        let bookCartPreloaded: BookCartState[] = []

        if (isInBrowser) {
            bookFavsPreloaded = JSON.parse(window.localStorage.getItem("bookFavs") ?? "[]")
            bookCartPreloaded = JSON.parse(window.localStorage.getItem("bookCart") ?? "[]")
        }

        storeRef.current = makeStore({
            bookFavs: {
                value: bookFavsPreloaded,
            },
            bookCart: {
                value: bookCartPreloaded,
            },
        })

        storeRef.current.subscribe(() => {
            const state = storeRef.current?.getState()

            if (!state || !isInBrowser) {
                return
            }

            window.localStorage.setItem("bookFavs", JSON.stringify(state.bookFavs.value))
            window.localStorage.setItem("bookCart", JSON.stringify(state.bookCart.value))
        })
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}

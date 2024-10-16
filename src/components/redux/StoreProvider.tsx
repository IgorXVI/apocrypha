"use client"

import { useEffect, useRef, useState } from "react"
import { Provider } from "react-redux"
import { useDebouncedCallback } from "use-debounce"
import { type POSTApiUserStateInput, type GETApiUserStateOutput } from "~/app/api/user/state/route"
import { type BookCartState } from "~/lib/redux/book-cart/bookCartSlice"
import { makeStore, type AppStore } from "~/lib/redux/store"
import LogoAndSpinner from "../loading/logo-and-spinner"

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>()

    const [bookFavs, setBookFavs] = useState<BookCartState[]>([])
    const [bookCart, setBookCart] = useState<BookCartState[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const saveStateFun = useDebouncedCallback((apiInput: POSTApiUserStateInput) => {
        fetch("/api/user/state", {
            method: "POST",
            body: JSON.stringify(apiInput.data),
        }).catch((error) => console.error(error))
    }, 500)

    const getStateFun = useDebouncedCallback(() => {
        if (!storeRef.current) {
            fetch("/api/user/state")
                .then((res) =>
                    res.json().then((json: GETApiUserStateOutput) => {
                        setIsLoading(false)
                        if (json.success) {
                            setBookCart(json.data?.bookCart ?? [])
                            setBookFavs(json.data?.bookFavs ?? [])
                        }
                    }),
                )
                .catch((error) => console.error(error))
        }
    }, 500)

    useEffect(() => {
        getStateFun()
    }, [getStateFun])

    if (isLoading) {
        return <LogoAndSpinner></LogoAndSpinner>
    }

    if (!storeRef.current) {
        // Create the store instance the first time this renders

        storeRef.current = makeStore({
            bookFavs: {
                value: bookFavs,
            },
            bookCart: {
                value: bookCart,
            },
        })

        storeRef.current.subscribe(() => {
            const state = storeRef.current?.getState()

            saveStateFun({
                data: {
                    bookCart: state?.bookCart.value ?? [],
                    bookFavs: state?.bookFavs.value ?? [],
                },
            })
        })
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}

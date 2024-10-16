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
        try {
            fetch("/api/user/state", {
                method: "POST",
                body: JSON.stringify(apiInput.data),
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
            }).catch((error) => console.error("API_POST_USER_STATE_ERROR:", error))
        } catch (error) {
            console.error("BEFORE_API_POST_USER_STATE_ERROR:", error)
        }
    }, 500)

    useEffect(() => {
        try {
            fetch("/api/user/state", {
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
            })
                .then((res) => {
                    return res
                        .json()
                        .then((json: GETApiUserStateOutput) => {
                            setIsLoading(false)
                            if (json.success) {
                                setBookCart(json.data?.bookCart ?? [])
                                setBookFavs(json.data?.bookFavs ?? [])
                            }
                        })
                        .catch((error) => {
                            setIsLoading(false)
                            console.error("API_GET_USER_STATE_RESPONSE_JSON_ERROR:", error)
                        })
                })
                .catch((error) => {
                    setIsLoading(false)
                    console.error("API_GET_USER_STATE_ERROR:", error)
                })
        } catch (error) {
            console.error("GET_STATE_FUN_ERROR:", error)
            setIsLoading(false)
        }
    }, [])

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

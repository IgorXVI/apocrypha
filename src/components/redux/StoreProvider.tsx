"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { useDebouncedCallback } from "use-debounce"
import { type POSTApiUserStateInput } from "~/app/api/user/state/route"
import { makeStore, type AppStore } from "~/lib/redux/store"
import { type UserClientSideState } from "~/lib/types"

export default function StoreProvider({ children, initialState }: { children: React.ReactNode; initialState?: UserClientSideState }) {
    const storeRef = useRef<AppStore>()

    const saveStateFun = useDebouncedCallback((apiInput: POSTApiUserStateInput) => {
        console.log("FETCH CALLED")
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
    }, 1000)

    if (!storeRef.current) {
        // Create the store instance the first time this renders

        if (initialState) {
            storeRef.current = makeStore({
                bookCart: {
                    value: initialState.bookCart,
                },
                bookFavs: {
                    value: initialState.bookFavs,
                },
            })

            console.log("CREATE SUBSCRIBE")
            storeRef.current.subscribe(() => {
                console.log("SUBSCRIBE CALLED")
                const state = storeRef.current?.getState()

                saveStateFun({
                    data: {
                        bookCart: state?.bookCart.value ?? [],
                        bookFavs: state?.bookFavs.value ?? [],
                    },
                })
            })
        } else {
            storeRef.current = makeStore({
                bookCart: {
                    value: [],
                },
                bookFavs: {
                    value: [],
                },
            })
        }
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}

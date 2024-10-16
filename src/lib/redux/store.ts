import { configureStore } from "@reduxjs/toolkit"
import { bookCartSlice, type BookCartState } from "./book-cart/bookCartSlice"
import { mainApi } from "./apis/main-api/main"
import { brasilApi } from "./apis/brasil-api/brasil"
import { bookFavsSlice } from "./book-favs/bookFavsSlice"

export const makeStore = (preloadedState: {
    bookFavs: {
        value: BookCartState[]
    }
    bookCart: {
        value: BookCartState[]
    }
}) =>
    configureStore({
        reducer: {
            bookCart: bookCartSlice.reducer,
            bookFavs: bookFavsSlice.reducer,
            [mainApi.reducerPath]: mainApi.reducer,
            [brasilApi.reducerPath]: brasilApi.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mainApi.middleware).concat(brasilApi.middleware),
        preloadedState,
    })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

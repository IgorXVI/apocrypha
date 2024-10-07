import { configureStore } from "@reduxjs/toolkit"
import { bookCartSlice } from "./book-cart/bookCartSlice"
import { mainApi } from "./apis/main-api/main"
import { brasilApi } from "./apis/brasil-api/brasil"

export const makeStore = () => {
    return configureStore({
        reducer: {
            bookCart: bookCartSlice.reducer,
            [mainApi.reducerPath]: mainApi.reducer,
            [brasilApi.reducerPath]: brasilApi.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mainApi.middleware).concat(brasilApi.middleware),
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

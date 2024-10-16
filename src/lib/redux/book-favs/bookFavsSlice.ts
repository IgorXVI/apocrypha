import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type BookCartState } from "../book-cart/bookCartSlice"

export const bookFavsSlice = createSlice({
    name: "bookFavs",
    initialState: {
        value: [] as BookCartState[],
    },
    reducers: () => ({
        add: (state, action: PayloadAction<BookCartState>) => {
            const book = state.value.find((book) => book.id === action.payload.id)
            if (book) {
                book.amount += action.payload.amount
            } else {
                state.value.push(action.payload)
            }
        },
        remove: (state, action: PayloadAction<string>) => {
            state.value = state.value.filter((book) => book.id !== action.payload)
        },
    }),
})

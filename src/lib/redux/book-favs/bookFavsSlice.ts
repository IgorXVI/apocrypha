import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type BookClientSideState } from "~/lib/types"

export const bookFavsSlice = createSlice({
    name: "bookFavs",
    initialState: {
        value: [] as BookClientSideState[],
    },
    reducers: () => ({
        replace: (state, action: PayloadAction<BookClientSideState[]>) => {
            state.value = action.payload
        },
        add: (state, action: PayloadAction<BookClientSideState>) => {
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

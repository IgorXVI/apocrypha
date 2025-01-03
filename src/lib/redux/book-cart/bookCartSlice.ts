import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type BookClientSideState } from "~/lib/types"

export const bookCartSlice = createSlice({
    name: "bookCart",
    initialState: {
        value: [] as BookClientSideState[],
    },
    reducers: {
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
        updateAmount: (state, action: PayloadAction<{ id: string; amount: number }>) => {
            if (action.payload.amount < 0) {
                return
            }

            const book = state.value.find((book) => book.id === action.payload.id)
            if (book) {
                book.amount = action.payload.amount
            }
        },
        removeAmount: (state, action: PayloadAction<{ id: string; amount: number }>) => {
            const book = state.value.find((book) => book.id === action.payload.id)
            if (book) {
                book.amount -= action.payload.amount

                if (book.amount <= 0) {
                    state.value = state.value.filter((book) => book.id !== action.payload.id)
                }
            }
        },
        remove: (state, action: PayloadAction<string>) => {
            state.value = state.value.filter((book) => book.id !== action.payload)
        },
    },
})

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type BookCartState = { id: string; title: string; author: string; price: number; currency: string; amount: number }

export const bookCartSlice = createSlice({
    name: "bookCart",
    initialState: {
        value: [] as BookCartState[],
    },
    reducers: {
        add: (state, action: PayloadAction<BookCartState>) => {
            const book = state.value.find((book) => book.id === action.payload.id)
            if (book) {
                book.amount += action.payload.amount
            } else {
                state.value.push(action.payload)
            }
        },
        remove: (state, action: PayloadAction<BookCartState>) => {
            const book = state.value.find((book) => book.id === action.payload.id)
            if (book) {
                book.amount -= action.payload.amount

                if (book.amount === 0) {
                    state.value = state.value.filter((book) => book.id !== action.payload.id)
                }
            }
        },
    },
})

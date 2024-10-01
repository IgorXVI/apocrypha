import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type BookCartState = {
    id: string
    mainImg: string
    title: string
    author: string
    price: number
    amount: number
    stripeId: string
}

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

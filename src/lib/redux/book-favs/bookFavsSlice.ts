import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export const bookFavsSlice = createSlice({
    name: "bookFavs",
    initialState: {
        value: {} as Record<string, boolean>,
        loading: false,
    },
    reducers: (create) => ({
        add: (state, action: PayloadAction<string>) => {
            state.value[action.payload] = true
        },
        remove: (state, action: PayloadAction<string>) => {
            state.value[action.payload] = true
        },
    }),
})

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface commonState {
    token: string
}
const initialState: commonState = {
    token: ''
}

export const commonSlice = createSlice({
    name: 'CommonSlice',
    initialState,
    reducers: {
        setToken: (state: commonState, action: PayloadAction<string>) => {
            state.token = action.payload
        }
    },
})

export const { setToken } = commonSlice.actions

export default commonSlice.reducer
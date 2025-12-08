import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CommonState {
    token: string
    userInfo: API.UserInfo | null
}

const initialState: CommonState = {
    token: '',
    userInfo: null,
}

export const commonSlice = createSlice({
    name: 'commonSlice',
    initialState,
    reducers: {
        setToken: (state: CommonState, action: PayloadAction<string>) => {
            state.token = action.payload
        },
        clearToken: (state: CommonState) => {
            state.token = ''
            state.userInfo = null
        },
        setUserInfo: (state: CommonState, action: PayloadAction<API.UserInfo | null>) => {
            state.userInfo = action.payload
        },
        clearUserInfo: (state: CommonState) => {
            state.userInfo = null
        },
    },
})

export const { setToken, clearToken, setUserInfo, clearUserInfo } = commonSlice.actions

export default commonSlice.reducer
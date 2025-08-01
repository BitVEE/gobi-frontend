import { configureStore } from '@reduxjs/toolkit'
import CommonSlice from './slice/commonSlice'

const store = configureStore({
    reducer: {
        CommonSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export {
    store
}
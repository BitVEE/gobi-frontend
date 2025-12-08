import { createSlice } from '@reduxjs/toolkit';

type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
    queue: ToastItem[];
}

export interface ToastItem {
    id: string;
    message: string;
    type?: ToastType;
    timeout?: number;
}

const initialState = {
    queue: [] as ToastItem[],
};

export const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action) => {
            state.queue.unshift({
                id: Date.now().toString(),
                timeout: 3000,
                ...action.payload
            });
        },
        removeToast: (state, action) => {
            state.queue = state.queue.filter(t => t.id !== action.payload);
        }
    }
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import predictionsReducer from './slices/predictionsSlice';
import financeReducer from './slices/financeSlice';
import websocketReducer from './slices/websocketSlice';
import usersReducer from './slices/usersSlice';
import { adminApi } from '../services/adminApi';
import { authMiddleware } from './authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    predictions: predictionsReducer,
    finance: financeReducer,
    websocket: websocketReducer,
    users: usersReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware, authMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

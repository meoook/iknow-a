import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserAuthed } from '../../types';

interface IAuthState {
  isAuthChecking: boolean;
  isAuthenticated: boolean;
  user: IUserAuthed | null;
  authCheckError: 'network' | 'server' | null;
  isConnected: boolean;
}

const initialState: IAuthState = {
  isAuthChecking: true,
  isAuthenticated: false,
  user: null,
  authCheckError: null,
  isConnected: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<IUserAuthed>) => {
      state.isAuthChecking = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.authCheckError = null;
    },
    setAuthFailed: (state) => {
      state.isAuthChecking = false;
      state.isAuthenticated = false;
      state.user = null;
      state.authCheckError = null;
      state.isConnected = false;
    },
    setAuthNetworkError: (state, action: PayloadAction<'network' | 'server'>) => {
      state.isAuthChecking = false;
      state.authCheckError = action.payload;
    },
    retryAuthCheck: (state) => {
      state.isAuthChecking = true;
      state.authCheckError = null;
    },
    logout: (state) => {
      state.isAuthChecking = false;
      state.isAuthenticated = false;
      state.user = null;
      state.authCheckError = null;
      state.isConnected = false;
    },
  },
});

export const {
  setConnectionStatus,
  setAuthUser,
  setAuthFailed,
  setAuthNetworkError,
  retryAuthCheck,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

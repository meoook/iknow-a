import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAdminUser } from '../../types';

interface IAuthState {
  isAuthChecking: boolean;
  isAuthenticated: boolean;
  user: IAdminUser | null;
  authCheckError: 'network' | 'server' | null;
}

const initialState: IAuthState = {
  isAuthChecking: true,
  isAuthenticated: false,
  user: null,
  authCheckError: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<IAdminUser>) => {
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
    },
  },
});

export const { setAuthUser, setAuthFailed, setAuthNetworkError, retryAuthCheck, logout } = authSlice.actions;
export default authSlice.reducer;

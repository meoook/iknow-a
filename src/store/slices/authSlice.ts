import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAdminUser } from '../../types';

interface IAuthState {
  isAuthChecking: boolean;
  isAuthenticated: boolean;
  user: IAdminUser | null;
}

const initialState: IAuthState = {
  isAuthChecking: true,
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<IAdminUser>) => {
      state.isAuthChecking = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    setAuthFailed: (state) => {
      state.isAuthChecking = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      state.isAuthChecking = false;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { setAuthUser, setAuthFailed, logout } = authSlice.actions;
export default authSlice.reducer;

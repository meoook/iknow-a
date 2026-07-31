import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserItem } from '../../types';
import { initialUsers } from '../../data/mockData';

interface IUsersState {
  users: IUserItem[];
}

const initialState: IUsersState = {
  users: initialUsers,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    toggleUserActive: (state, action: PayloadAction<number>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.isActive = !user.isActive;
      }
    },

    toggleUserWithdrawBlocked: (state, action: PayloadAction<number>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.withdrawBlocked = !user.withdrawBlocked;
      }
    },

    changeUserPassword: (
      _state,
      _action: PayloadAction<{ userId: number; newPassword: string }>
    ) => {
      // Simulated action for UI feedback
    },
  },
});

export const { toggleUserActive, toggleUserWithdrawBlocked, changeUserPassword } =
  usersSlice.actions;

export default usersSlice.reducer;

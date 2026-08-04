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
        user.is_active = !user.is_active;
      }
    },

    toggleUserWithdrawBlocked: (state, action: PayloadAction<number>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.withdraw_blocked = !user.withdraw_blocked;
      }
    },

    toggleUserStaff: (state, action: PayloadAction<number>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.is_staff = !user.is_staff;
      }
    },

    toggleUserSuperuser: (state, action: PayloadAction<number>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.is_superuser = !user.is_superuser;
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

export const {
  toggleUserActive,
  toggleUserWithdrawBlocked,
  toggleUserStaff,
  toggleUserSuperuser,
  changeUserPassword,
} = usersSlice.actions;

export default usersSlice.reducer;

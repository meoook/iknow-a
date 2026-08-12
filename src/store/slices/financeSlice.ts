import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { IExternalTxItem } from '../../types';
import { RootState } from '../index';

export const txAdapter = createEntityAdapter<IExternalTxItem>({
  sortComparer: (a, b) => b.id - a.id,
});

export const withdrawalsAdapter = createEntityAdapter<IExternalTxItem>({
  sortComparer: (a, b) => b.id - a.id,
});

import { initialBankInfo } from '../../data/mockData';

const initialState = {
  bankInfo: initialBankInfo,
  transactions: txAdapter.getInitialState(),
  withdrawals: withdrawalsAdapter.getInitialState(),
  hasUnreadWithdrawals: false,
  unreadWithdrawalsCount: 0,
};


export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<IExternalTxItem[]>) => {
      txAdapter.setAll(state.transactions, action.payload);
    },
    upsertTransaction: (state, action: PayloadAction<IExternalTxItem>) => {
      txAdapter.upsertOne(state.transactions, action.payload);
    },
    updateTransaction: (state, action: PayloadAction<{ id: number; changes: Partial<IExternalTxItem> }>) => {
      txAdapter.updateOne(state.transactions, action.payload);
    },

    setWithdrawals: (state, action: PayloadAction<IExternalTxItem[]>) => {
      const filtered = action.payload.filter((w) => w.direction === 'OUT');
      withdrawalsAdapter.setAll(state.withdrawals, filtered);
    },
    upsertWithdrawal: (state, action: PayloadAction<IExternalTxItem>) => {
      if (action.payload.direction === 'OUT') {
        withdrawalsAdapter.upsertOne(state.withdrawals, action.payload);
      }
    },
    removeWithdrawal: (state, action: PayloadAction<number>) => {
      withdrawalsAdapter.removeOne(state.withdrawals, action.payload);
    },
    updateWithdrawal: (state, action: PayloadAction<{ id: number; changes: Partial<IExternalTxItem> }>) => {
      withdrawalsAdapter.updateOne(state.withdrawals, action.payload);
    },

    addWsWithdrawalBadge: (state) => {
      state.hasUnreadWithdrawals = true;
      state.unreadWithdrawalsCount += 1;
    },
    clearWithdrawalsBadge: (state) => {
      state.hasUnreadWithdrawals = false;
      state.unreadWithdrawalsCount = 0;
    },
  },
});

export const {
  setTransactions,
  upsertTransaction,
  updateTransaction,
  setWithdrawals,
  upsertWithdrawal,
  removeWithdrawal,
  updateWithdrawal,
  addWsWithdrawalBadge,
  clearWithdrawalsBadge,
} = financeSlice.actions;

export const transactionsSelectors = txAdapter.getSelectors<RootState>(
  (state) => state.finance.transactions
);

export const withdrawalsSelectors = withdrawalsAdapter.getSelectors<RootState>(
  (state) => state.finance.withdrawals
);

export default financeSlice.reducer;

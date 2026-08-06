import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IBankInfo,
  ITransactionItem,
  IWithdrawalRequestItem,
} from '../../types';
import {
  initialBankInfo,
  initialTransactions,
  initialWithdrawalRequests,
} from '../../data/mockData';

interface IFinanceState {
  bankInfo: IBankInfo;
  transactions: ITransactionItem[];
  withdrawals: IWithdrawalRequestItem[];
  hasUnreadWithdrawals: boolean;
}

const initialState: IFinanceState = {
  bankInfo: initialBankInfo,
  transactions: initialTransactions,
  withdrawals: initialWithdrawalRequests,
  hasUnreadWithdrawals: initialWithdrawalRequests.some((w) => w.hasUnreadWsEvent),
};

export const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    approveWithdrawal: (
      state,
      action: PayloadAction<{ id: string; txHash?: string }>
    ) => {
      const { id, txHash } = action.payload;
      const wreq = state.withdrawals.find((w) => w.id === id);

      if (wreq) {
        wreq.status = 'APPROVED';
        wreq.txHash =
          txHash ||
          '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        wreq.hasUnreadWsEvent = false;

        // Add to completed transactions
        const newTx: ITransactionItem = {
          id: `tx-${Date.now()}`,
          user: wreq.user.username,
          direction: 'OUT',
          type: 'WITHDRAW',
          amount: wreq.amount,
          token: wreq.token,
          chain: wreq.chain,
          txHash: wreq.txHash,
          status: 'COMPLETED',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };

        state.transactions.unshift(newTx);
        state.withdrawals = state.withdrawals.filter((w) => w.id !== id);

        // Update total balance
        state.bankInfo.bankTotalBalanceUsd -= wreq.amount;
        state.bankInfo.hotWalletsUsd -= wreq.amount;
      }

      state.hasUnreadWithdrawals = state.withdrawals.some((w) => w.hasUnreadWsEvent);
    },

    rejectWithdrawal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const wreq = state.withdrawals.find((w) => w.id === id);

      if (wreq) {
        wreq.status = 'REJECTED';
        wreq.hasUnreadWsEvent = false;

        const newTx: ITransactionItem = {
          id: `tx-${Date.now()}`,
          user: wreq.user.username,
          direction: 'OUT',
          type: 'WITHDRAW',
          amount: wreq.amount,
          token: wreq.token,
          chain: wreq.chain,
          txHash: 'REJECTED_BY_ADMIN',
          status: 'FAILED',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };

        state.transactions.unshift(newTx);
        state.withdrawals = state.withdrawals.filter((w) => w.id !== id);
      }

      state.hasUnreadWithdrawals = state.withdrawals.some((w) => w.hasUnreadWsEvent);
    },

    clearWithdrawalsBadge: (state) => {
      state.withdrawals.forEach((w) => {
        w.hasUnreadWsEvent = false;
      });
      state.hasUnreadWithdrawals = false;
    },

    addWsWithdrawalRequest: (state, action: PayloadAction<IWithdrawalRequestItem>) => {
      const newItem = {
        ...action.payload,
        hasUnreadWsEvent: true,
      };
      state.withdrawals.unshift(newItem);
      state.hasUnreadWithdrawals = true;
    },
  },
});

export const {
  approveWithdrawal,
  rejectWithdrawal,
  clearWithdrawalsBadge,
  addWsWithdrawalRequest,
} = financeSlice.actions;

export default financeSlice.reducer;

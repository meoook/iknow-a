import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { clearWithdrawalsBadge, setWithdrawals, withdrawalsSelectors } from '../../../store/slices/financeSlice';
import {
  useGetAdminTxsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} from '../../../services/adminApi';
import { IExternalTxItem } from '../../../types';
import { WithdrawalsTable } from './WithdrawalsTable';
import { WithdrawalApprovalModal } from './WithdrawalApprovalModal';

export const WithdrawalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: apiWithdrawals } = useGetAdminTxsQuery({ withdraw: 1 });

  useEffect(() => {
    if (apiWithdrawals && Array.isArray(apiWithdrawals)) {
      dispatch(setWithdrawals(apiWithdrawals));
    }
  }, [apiWithdrawals, dispatch]);

  const withdrawals = useAppSelector(withdrawalsSelectors.selectAll);

  const hasUnread = useAppSelector((state) => state.finance.hasUnreadWithdrawals);
  const currentUser = useAppSelector((state) => state.auth.user);

  const isSuperuser = currentUser?.is_superuser ?? true;

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IExternalTxItem | null>(null);
  const [manualTxHash, setManualTxHash] = useState<string>('');

  const [approveWithdrawalApi] = useApproveWithdrawalMutation();
  const [rejectWithdrawalApi] = useRejectWithdrawalMutation();

  useEffect(() => {
    if (hasUnread) {
      dispatch(clearWithdrawalsBadge());
    }
  }, [hasUnread, dispatch]);

  const handleOpenModal = (w: IExternalTxItem) => {
    if (!isSuperuser) return;
    setSelectedWithdrawal(w);
    setManualTxHash('');
  };

  const handleCloseModal = () => {
    setSelectedWithdrawal(null);
  };

  const handleConfirmApprove = async () => {
    if (selectedWithdrawal && isSuperuser) {
      try {
        await approveWithdrawalApi(selectedWithdrawal.id).unwrap();
      } catch (err) {
        console.error('Failed to approve withdrawal', err);
      }
      handleCloseModal();
    }
  };

  const handleConfirmReject = async (id: number) => {
    if (!isSuperuser) return;
    try {
      await rejectWithdrawalApi(id).unwrap();
    } catch (err) {
      console.error('Failed to reject withdrawal', err);
    }
    if (selectedWithdrawal?.id === id) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      <WithdrawalsTable
        withdrawals={withdrawals}
        isSuperuser={isSuperuser}
        onOpenModal={handleOpenModal}
        onConfirmReject={handleConfirmReject}
      />
      <WithdrawalApprovalModal
        selectedWithdrawal={selectedWithdrawal}
        isSuperuser={isSuperuser}
        manualTxHash={manualTxHash}
        onManualTxHashChange={setManualTxHash}
        onClose={handleCloseModal}
        onConfirmApprove={handleConfirmApprove}
      />
    </div>
  );
};

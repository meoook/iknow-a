import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  approveWithdrawal,
  rejectWithdrawal,
  clearWithdrawalsBadge,
} from '../../../store/slices/financeSlice';
import { IWithdrawalRequestItem } from '../../../types';
import { WithdrawalsHeader } from './WithdrawalsHeader';
import { WithdrawalsTable } from './WithdrawalsTable';
import { WithdrawalApprovalModal } from './WithdrawalApprovalModal';

export const WithdrawalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const withdrawals = useAppSelector((state) => state.finance.withdrawals);
  const hasUnread = useAppSelector((state) => state.finance.hasUnreadWithdrawals);
  const currentUser = useAppSelector((state) => state.auth.user);

  const isSuperuser = currentUser?.is_superuser ?? true;

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IWithdrawalRequestItem | null>(null);
  const [manualTxHash, setManualTxHash] = useState<string>('');

  useEffect(() => {
    if (hasUnread) {
      dispatch(clearWithdrawalsBadge());
    }
  }, [hasUnread, dispatch]);

  const handleOpenModal = (w: IWithdrawalRequestItem) => {
    if (!isSuperuser) return;
    setSelectedWithdrawal(w);
    setManualTxHash('');
  };

  const handleCloseModal = () => {
    setSelectedWithdrawal(null);
  };

  const handleConfirmApprove = () => {
    if (selectedWithdrawal && isSuperuser) {
      dispatch(
        approveWithdrawal({
          id: selectedWithdrawal.id,
          txHash: manualTxHash.trim() || undefined,
        })
      );
      handleCloseModal();
    }
  };

  const handleConfirmReject = (id: string) => {
    if (!isSuperuser) return;
    dispatch(rejectWithdrawal(id));
    if (selectedWithdrawal?.id === id) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      <WithdrawalsHeader
        queueCount={withdrawals.length}
        isSuperuser={isSuperuser}
      />
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

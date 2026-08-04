import React from 'react';
import { useAppSelector } from '../../../store';
import { FinanceKpiCards } from './FinanceKpiCards';
import { FinanceWalletsList } from './FinanceWalletsList';

export const FinanceInfoPage: React.FC = () => {
  const bankInfo = useAppSelector((state) => state.finance.bankInfo);

  return (
    <div className="space-y-6">
      <FinanceKpiCards bankInfo={bankInfo} />
      <FinanceWalletsList wallets={bankInfo.wallets} />
    </div>
  );
};

import React from 'react';
import { IFinanceDashboard, IFinanceSnapshot } from '../../types';
import { BankBalanceCoverageCard } from './BankBalanceCoverageCard';
import { TransactionsInOutCard } from './TransactionsInOutCard';
import { EarnedFeeCard } from './EarnedFeeCard';
import { UserFundsCard } from './UserFundsCard';
import { BetsTodayCard } from './BetsTodayCard';

interface DashboardKpiCardsProps {
  data: IFinanceDashboard;
  snapshots?: IFinanceSnapshot[];
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ data, snapshots }) => {
  return (
    <div className="space-y-4 font-sans">
      {/* Row 1: Bank Balance vs Active Bets Coverage & In/Out Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BankBalanceCoverageCard
          bankBalance={data.bank_balance}
          activeBetsAmount={data.active_bets_amount}
        />
        <TransactionsInOutCard
          txsToday={data.txs_today}
          txsTotal={data.txs_total}
        />
      </div>

      {/* Row 2: Featured Earned Fee Card with Chart (Left) & Stacked User Funds / Bets Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EarnedFeeCard
          bankFeeBalance={data.bank_fee_balance}
          bankFeeToday={data.bank_fee_today || 0}
          snapshots={snapshots}
        />

        <div className="flex flex-col gap-4 justify-between">
          <UserFundsCard usersBalance={data.users_balance} />
          <BetsTodayCard betsToday={data.bets_today} />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { DashboardActivePredictionsPreview } from './DashboardActivePredictionsPreview';
import { DashboardRecentTransactions } from './DashboardRecentTransactions';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardKpiGrid />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardActivePredictionsPreview />
        <DashboardRecentTransactions />
      </div>
    </div>
  );
};

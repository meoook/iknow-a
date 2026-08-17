import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useGetFinanceInfoQuery } from '../../services/adminApi';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardProgressBar } from './DashboardProgressBar';

export const DashboardPage: React.FC = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetFinanceInfoQuery();

  if (isLoading && !dashboardData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 min-h-[350px]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <span className="text-sm font-semibold text-slate-400">
          Загрузка показателей дашборда...
        </span>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-200">Ошибка загрузки дашборда</h2>
        <p className="text-xs text-slate-400">
          Не удалось получить актуальные данные с сервера. Попробуйте обновить страницу.
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <DashboardProgressBar onRefresh={refetch} intervalSeconds={60} />
      <DashboardKpiCards data={dashboardData} />
    </div>
  );
};

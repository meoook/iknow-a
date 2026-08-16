import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../../store';
import {
  useGetFinanceChainsQuery,
  useUpdateFinanceChainMutation,
  useUpdateFinanceTokenMutation,
} from '../../../services/adminApi';
import { FinanceChainsList } from './FinanceChainsList';

export const FinanceChainsPage: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isSuperuser = currentUser?.is_superuser === true;

  const { data: chainsData, isLoading, error } = useGetFinanceChainsQuery();
  const [updateChain] = useUpdateFinanceChainMutation();
  const [updateToken] = useUpdateFinanceTokenMutation();

  const handleToggleChain = (chainId: number, active: boolean) => {
    if (!isSuperuser) return;
    updateChain({ id: chainId, active }).unwrap().catch(() => { });
  };

  const handleToggleToken = (tokenId: number, active: boolean) => {
    if (!isSuperuser) return;
    updateToken({ id: tokenId, active }).unwrap().catch(() => { });
  };

  if (isLoading && !chainsData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 min-h-[350px]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <span className="text-sm font-semibold text-slate-400">
          Загрузка блокчейн сетей и токенов...
        </span>
      </div>
    );
  }

  if (error || !chainsData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-200">Ошибка загрузки блокчейн сетей</h2>
        <p className="text-xs text-slate-400">
          Не удалось получить список сетей с сервера. Попробуйте обновить страницу.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <FinanceChainsList
        chains={chainsData}
        isSuperuser={isSuperuser}
        onToggleChain={handleToggleChain}
        onToggleToken={handleToggleToken}
      />
    </div>
  );
};

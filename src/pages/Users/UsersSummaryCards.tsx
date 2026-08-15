import React from 'react';
import { Users, UserPlus, Wallet } from 'lucide-react';

interface UsersSummaryCardsProps {
  totalUsers: number;
  newUsersCount: number;
  totalBalance: number;
}

export const UsersSummaryCards: React.FC<UsersSummaryCardsProps> = ({
  totalUsers,
  newUsersCount,
  totalBalance,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Total Users Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Всего пользователей</p>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-2 font-mono">{totalUsers}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Зарегистрированных аккаунтов</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* New Users Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Новых пользователей</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{newUsersCount}</h3>
            <p className="text-[11px] text-emerald-500/90 mt-1 font-semibold">За сегодня</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
            <UserPlus size={24} />
          </div>
        </div>
      </div>

      {/* Total Users Balance Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Баланс пользователей</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Суммарные балансы на кошельках</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

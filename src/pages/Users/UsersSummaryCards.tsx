import React from 'react';
import { Users, UserPlus, Wallet, Activity, Ban } from 'lucide-react';
import { useGetUsersInfoQuery } from '@/services/adminApi';


export const UsersSummaryCards: React.FC = () => {
  const { data } = useGetUsersInfoQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
      {/* Total Users Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Всего</p>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-2 font-mono">{data?.total_users || '—'}</h3>
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
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Новые</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{data?.new_users || 0}</h3>
            <p className="text-[11px] text-emerald-500/90 mt-1 font-semibold">За последние 24ч.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
            <UserPlus size={24} />
          </div>
        </div>
      </div>

      {/* Active Users Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Активные</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">{data?.active || 0}</h3>
            <p className="text-[11px] text-emerald-500/90 mt-1 font-semibold">За последние 24ч.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Blocked Users Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-red-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Заблокированные</p>
            <h3 className="text-2xl font-extrabold text-red-400 mt-2 font-mono">{data?.blocked || 0}</h3>
            <p className="text-[11px] text-emerald-500/90 mt-1 font-semibold">Заблокировано</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
            <Ban size={24} />
          </div>
        </div>
      </div>

      {/* Withdraw blocked Users Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-red-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Вывод заблокирован</p>
            <h3 className="text-2xl font-extrabold text-red-400 mt-2 font-mono">{data?.withdraw || 0}</h3>
            <p className="text-[11px] text-red-500/90 mt-1 font-semibold">Запрещен вывод средств</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
        </div>
      </div>

    </div>
  );
};

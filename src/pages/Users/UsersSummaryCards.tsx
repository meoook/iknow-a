import React from 'react';
import { Users, UserPlus, Activity, UserX, ShieldAlert } from 'lucide-react';
import { useGetUsersInfoQuery } from '../../services/adminApi';

export const UsersSummaryCards: React.FC = () => {
  const { data } = useGetUsersInfoQuery();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 font-sans">
      {/* 1. Всего пользователей */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-cyan-500/30 transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Всего</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 font-mono">
              {data?.total_users ?? '—'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <Users size={18} />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate">Всего аккаунтов</p>
      </div>

      {/* 2. Новые за 24ч */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Новые</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">
              {data?.new_users ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <UserPlus size={18} />
          </div>
        </div>
        <p className="text-[11px] text-emerald-400/80 mt-2 font-medium truncate">За последние 24ч</p>
      </div>

      {/* 3. Активные за 24ч */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Активные</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-400 mt-1 font-mono">
              {data?.active ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <Activity size={18} />
          </div>
        </div>
        <p className="text-[11px] text-blue-400/80 mt-2 font-medium truncate">Активность за 24ч</p>
      </div>

      {/* 4. Заблокированные */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-rose-500/30 transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Заблокированы</p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-400 mt-1 font-mono">
              {data?.blocked ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <UserX size={18} />
          </div>
        </div>
        <p className="text-[11px] text-rose-400/80 mt-2 font-medium truncate">Полная блокировка</p>
      </div>

      {/* 5. Вывод заблокирован */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl glass-panel relative overflow-hidden group hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-md col-span-2 sm:col-span-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Блок вывода</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono">
              {data?.withdraw ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <ShieldAlert size={18} />
          </div>
        </div>
        <p className="text-[11px] text-amber-400/80 mt-2 font-medium truncate">Запрет выплат</p>
      </div>
    </div>
  );
};

import React from 'react';
import { Users } from 'lucide-react';

interface UserFundsCardProps {
  usersBalance: number;
}

export const UserFundsCard: React.FC<UserFundsCardProps> = ({ usersBalance }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative flex flex-col justify-between shadow-xl flex-1 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Средства пользователей
        </span>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
          <Users size={18} />
        </div>
      </div>

      <div className="my-2">
        <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
          ${usersBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-xs text-slate-500 font-medium mt-1 block">
          Депозиты всех зарегистрированных игроков
        </span>
      </div>

      <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>Статус резервов</span>
        <span className="text-emerald-400 font-bold">100% покрытие</span>
      </div>
    </div>
  );
};

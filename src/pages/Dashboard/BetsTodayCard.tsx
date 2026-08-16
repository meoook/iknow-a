import React from 'react';
import { TrendingUp } from 'lucide-react';
import { IFinanceDashboard } from '../../types';

interface BetsTodayCardProps {
  betsToday: IFinanceDashboard['bets_today'];
}

export const BetsTodayCard: React.FC<BetsTodayCardProps> = ({ betsToday }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative flex flex-col justify-between shadow-xl flex-1 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Ставки за сегодня
        </span>
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <TrendingUp size={18} />
        </div>
      </div>

      <div className="my-2">
        <div className="text-2xl font-black text-blue-400 font-mono tracking-tight">
          ${betsToday.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <span className="text-xs text-slate-500 font-medium mt-1 block">
          {betsToday.total_count} ставок оформлено за сегодня
        </span>
      </div>

      <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>Активность игроков</span>
        <span className="text-cyan-400 font-bold">Высокая</span>
      </div>
    </div>
  );
};

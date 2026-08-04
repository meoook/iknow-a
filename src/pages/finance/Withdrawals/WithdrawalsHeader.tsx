import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface WithdrawalsHeaderProps {
  queueCount: number;
  isSuperuser: boolean;
}

export const WithdrawalsHeader: React.FC<WithdrawalsHeaderProps> = ({
  queueCount,
  isSuperuser,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-slate-400">
        <span>Запросы на вывод средств, ожидающие подтверждения</span>
        {queueCount > 0 && (
          <span className="bg-rose-500/20 text-rose-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
            {queueCount} в очереди
          </span>
        )}
      </div>

      {!isSuperuser && (
        <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Подтверждение выплат ограничено (требуются права Superuser)</span>
        </div>
      )}
    </div>
  );
};

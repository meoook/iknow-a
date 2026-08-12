import React from 'react';
import { Search } from 'lucide-react';

interface TransactionsFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterDirection: 'ALL' | 'IN' | 'OUT';
  onDirectionChange: (dir: 'ALL' | 'IN' | 'OUT') => void;
}

export const TransactionsFilter: React.FC<TransactionsFilterProps> = ({
  searchQuery,
  onSearchChange,
  filterDirection,
  onDirectionChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по хэшу или пользователю..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Фильтр:</span>
        <button
          onClick={() => onDirectionChange('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filterDirection === 'ALL'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
        >
          Все
        </button>
        <button
          onClick={() => onDirectionChange('IN')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filterDirection === 'IN'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
        >
          Ввод (IN)
        </button>
        <button
          onClick={() => onDirectionChange('OUT')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filterDirection === 'OUT'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
        >
          Вывод (OUT)
        </button>

      </div>
    </div>
  );
};

import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

interface ActivePredictionsToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortBy: 'date' | 'volume';
  sortOrder: 'asc' | 'desc';
  onSortByVolume: () => void;
  onSortByDate: () => void;
}

export const ActivePredictionsToolbar: React.FC<ActivePredictionsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortByVolume,
  onSortByDate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск предсказания по названию..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Сортировка:</span>

        <button
          onClick={onSortByVolume}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
            sortBy === 'volume'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>По объему</span>
          <ArrowUpDown size={12} />
        </button>

        <button
          onClick={onSortByDate}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
            sortBy === 'date'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>По дате</span>
          <ArrowUpDown size={12} />
        </button>
      </div>
    </div>
  );
};

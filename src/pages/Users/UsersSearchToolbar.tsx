import React from 'react';
import { Search } from 'lucide-react';

interface UsersSearchToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  foundCount: number;
}

export const UsersSearchToolbar: React.FC<UsersSearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  foundCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 glass-panel">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по логину, почте, ID или Telegram..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>
      <div className="text-xs text-slate-400 font-mono">
        Найдено аккаунтов: <span className="text-cyan-400 font-bold">{foundCount}</span>
      </div>
    </div>
  );
};

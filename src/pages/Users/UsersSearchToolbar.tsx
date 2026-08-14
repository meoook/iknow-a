import React from 'react';
import { Search, User, ShieldAlert } from 'lucide-react';

interface UsersSearchToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: 'user' | 'admin';
  onRoleFilterChange: (role: 'user' | 'admin') => void;
}

export const UsersSearchToolbar: React.FC<UsersSearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 glass-panel">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по id, username, email или address..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Role Filter Buttons */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => onRoleFilterChange('user')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
            roleFilter === 'user'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <User size={13} />
          <span>Пользователи</span>
        </button>
        <button
          onClick={() => onRoleFilterChange('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
            roleFilter === 'admin'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <ShieldAlert size={13} />
          <span>Админы</span>
        </button>
      </div>
    </div>
  );
};

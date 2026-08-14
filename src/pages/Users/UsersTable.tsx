import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  User,
} from 'lucide-react';
import { IUserItem } from '../../types';
import { formatDisplayDate } from '../../utils/dates';

interface UsersTableProps {
  currentUsers: IUserItem[];
  displayUsersCount: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  onRowClick: (userId: number) => void;
  onPageChange: (page: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  currentUsers,
  displayUsersCount,
  itemsPerPage,
  currentPage,
  totalPages,
  startIndex,
  onRowClick,
  onPageChange,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden glass-panel shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Пользователь</th>
              <th className="py-3.5 px-4">Email / Address</th>
              <th className="py-3.5 px-4">Баланс</th>
              <th className="py-3.5 px-4">Статус</th>
              <th className="py-3.5 px-4">Вывод</th>
              <th className="py-3.5 px-4">Роль</th>
              <th className="py-3.5 px-5 text-right">Регистрация</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                  Пользователей по данному запросу не найдено
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onRowClick(user.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Пользователь */}
                  <td className="py-4 px-5 font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0 shadow-md">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-cyan-400 transition-colors">
                          <span>@{user.username}</span>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email / Address */}
                  <td className="py-4 px-4 font-mono text-slate-300">
                    <div className="truncate max-w-[200px]" title={user.email}>{user.email || '—'}</div>
                    {user.address && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={user.address}>
                        {user.address}
                      </div>
                    )}
                  </td>


                  {/* Баланс */}
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                    ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Активный */}
                  <td className="py-4 px-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 size={12} />
                        <span>Активен</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                        <XCircle size={12} />
                        <span>Заблокирован</span>
                      </span>
                    )}
                  </td>

                  {/* Withdraw */}
                  <td className="py-4 px-4">
                    {user.withdraw_blocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        <Ban size={12} />
                        <span>Запрещен</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <ShieldCheck size={12} />
                        <span>Разрешен</span>
                      </span>
                    )}
                  </td>

                  {/* Роль */}
                  <td className="py-4 px-4">
                    {user.is_superuser ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase">
                        <ShieldAlert size={10} />
                        <span>Superuser</span>
                      </span>
                    ) : user.is_staff ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase">
                        <span>Staff</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md uppercase">
                        <User size={10} />
                        <span>User</span>
                      </span>
                    )}
                  </td>

                  {/* Регистрация */}
                  <td className="py-4 px-5 text-right font-mono text-slate-400">
                    {formatDisplayDate(user.created)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {displayUsersCount > itemsPerPage && (
        <div className="px-5 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            Показаны пользователи {startIndex + 1}-{Math.min(startIndex + itemsPerPage, displayUsersCount)} из {displayUsersCount}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-bold">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

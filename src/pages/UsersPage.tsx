import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  UserPlus,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useAppSelector } from '../store';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const users = useAppSelector((state) => state.users.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate Dashboard Metrics
  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + (u.balanceUsd || 0), 0);
  
  // New users (e.g. registered recently or in 2026-05/06)
  const newUsersCount = users.filter((u) => u.createdAt >= '2026-05-01').length;

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      String(u.id).includes(searchQuery.trim()) ||
      (u.telegramId && String(u.telegramId).includes(searchQuery.trim()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-400" />
          <span>Дашборд пользователей</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Общий обзор метрик пользователей, поиск и управление аккаунтами платформы.
        </p>
      </div>

      {/* Top Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Users Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Всего пользователей</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-2 font-mono">{totalUsers}</h3>
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
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Новых пользователей</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">+{newUsersCount}</h3>
              <p className="text-[11px] text-emerald-500/90 mt-1 font-semibold">За последний период</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
          </div>
        </div>

        {/* Total Users Balance Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Баланс пользователей</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Суммарные балансы на кошельках</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 glass-panel">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Поиск по логину, почте, ID или Telegram..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Найдено аккаунтов: <span className="text-cyan-400 font-bold">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Users Table List (3-5 rows per page) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden glass-panel shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Пользователь</th>
                <th className="py-3.5 px-4">Почта / TG ID</th>
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
                    onClick={() => handleRowClick(user.id)}
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

                    {/* Почта */}
                    <td className="py-4 px-4 font-mono text-slate-300">
                      <div>{user.email}</div>
                      {user.telegramId && (
                        <div className="text-[10px] text-slate-500">TG: {user.telegramId}</div>
                      )}
                    </td>

                    {/* Баланс */}
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      ${user.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Активный */}
                    <td className="py-4 px-4">
                      {user.isActive ? (
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
                      {user.withdrawBlocked ? (
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
                      {user.isSuperuser ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase">
                          <ShieldAlert size={10} />
                          <span>Superuser</span>
                        </span>
                      ) : user.isStaff ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase">
                          <span>Staff</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">User</span>
                      )}
                    </td>

                    {/* Регистрация */}
                    <td className="py-4 px-5 text-right font-mono text-slate-400">
                      {user.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredUsers.length > itemsPerPage && (
          <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Показаны пользователи {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} из {filteredUsers.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-bold">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  KeyRound,
  Ban,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  toggleUserActive,
  toggleUserWithdrawBlocked,
  changeUserPassword,
} from '../store/slices/usersSlice';
import { IUserItem } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

export const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setSelectedUser(null), !!selectedUser);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleOpenModal = (user: IUserItem) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordSuccess(false);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setNewPassword('');
    setPasswordSuccess(false);
  };

  const handleToggleActive = (id: number) => {
    dispatch(toggleUserActive(id));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
    }
  };

  const handleToggleWithdrawBlocked = (id: number) => {
    dispatch(toggleUserWithdrawBlocked(id));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser((prev) =>
        prev ? { ...prev, withdrawBlocked: !prev.withdrawBlocked } : null
      );
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && newPassword.trim()) {
      dispatch(changeUserPassword({ userId: selectedUser.id, newPassword }));
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 glass-panel">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Управление пользователями</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Список зарегистрированных пользователей, их балансы, статусы активности и вывода средств.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или почте..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Всего пользователей: <span className="text-cyan-400 font-bold">{users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Имя</th>
                <th className="py-3.5 px-4">Почта</th>
                <th className="py-3.5 px-4">Баланс</th>
                <th className="py-3.5 px-4">Активный</th>
                <th className="py-3.5 px-4">Withdraw</th>
                <th className="py-3.5 px-4 text-right">Создан</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Пользователей не найдено
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleOpenModal(user)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Имя */}
                    <td className="py-3.5 px-4 font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-cyan-400">
                          {user.username[0].toUpperCase()}
                        </span>
                        <span>@{user.username}</span>
                      </div>
                    </td>

                    {/* Почта */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {user.email}
                    </td>

                    {/* Баланс */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ${user.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Активный */}
                    <td className="py-3.5 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={12} />
                          <span>Да</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          <XCircle size={12} />
                          <span>Заблокирован</span>
                        </span>
                      )}
                    </td>

                    {/* Withdraw */}
                    <td className="py-3.5 px-4">
                      {user.withdrawBlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <Ban size={12} />
                          <span>Заблокирован</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <ShieldCheck size={12} />
                          <span>Разрешен</span>
                        </span>
                      )}
                    </td>

                    {/* Создан */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      {user.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Users size={18} />
                <span>Редактирование пользователя @{selectedUser.username}</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Controls */}
            <div className="mt-5 space-y-5 text-xs">
              {/* User Overview */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center font-mono">
                <div>
                  <div className="text-slate-400 text-[10px]">Email:</div>
                  <div className="text-slate-200 font-bold">{selectedUser.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Баланс:</div>
                  <div className="text-emerald-400 font-extrabold text-sm">
                    ${selectedUser.balanceUsd.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div>
                    <span className="font-bold text-slate-200 block">Статус аккаунта (active)</span>
                    <span className="text-[10px] text-slate-400">
                      {selectedUser.isActive
                        ? 'Аккаунт включен и может входить на платформу'
                        : 'Аккаунт отключен'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(selectedUser.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedUser.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedUser.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Withdraw Blocked Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div>
                    <span className="font-bold text-slate-200 block">Блокировка вывода (withdraw_blocked)</span>
                    <span className="text-[10px] text-slate-400">
                      {selectedUser.withdrawBlocked
                        ? 'Вывод средств заблокирован'
                        : 'Вывод средств разрешен'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleWithdrawBlocked(selectedUser.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedUser.withdrawBlocked ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedUser.withdrawBlocked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Password Change Section */}
              <form onSubmit={handleChangePassword} className="pt-3 border-t border-slate-800 space-y-2">
                <label className="block font-bold text-slate-200 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-cyan-400" />
                  <span>Сменить пароль пользователя</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Новый пароль..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    Сохранить
                  </button>
                </div>
                {passwordSuccess && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <Check size={12} />
                    <span>Пароль успешно изменен!</span>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

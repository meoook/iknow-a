import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  Archive,
  Wallet,
  ArrowLeftRight,
  Send,
  Flame,
  Coins,
  Users,
} from 'lucide-react';
import { useAppSelector } from '../../store';

interface NavGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, icon, children }) => {
  return (
    <div className="mb-3">
      <div className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
        {icon}
        <span>{title}</span>
      </div>
      <div className="mt-1 space-y-1 pl-2">{children}</div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const hasUnreadNewRequests = useAppSelector(
    (state) => state.predictions.hasUnreadNewRequests
  );
  const unreadRequestsCount = useAppSelector(
    (state) => state.predictions.requests.filter((r) => r.hasUnreadWsEvent).length
  );

  const isConnected = useAppSelector((state) => state.websocket.isConnected);

  const hasUnreadWithdrawals = useAppSelector(
    (state) => state.finance.hasUnreadWithdrawals
  );
  const unreadWithdrawalsCount = useAppSelector(
    (state) => state.finance.withdrawals.filter((w) => w.hasUnreadWsEvent).length
  );

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-40 select-none glass-panel">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              IKNOW <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">ADMIN</span>
            </h1>
            <p className="text-xs text-slate-400">Управление платформой</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {/* Main Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border-l-4 border-cyan-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>Дашборд</span>
        </NavLink>

        {/* Users Management */}
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border-l-4 border-cyan-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`
          }
        >
          <Users size={18} />
          <span>Пользователи</span>
        </NavLink>

        {/* Group 1: Предсказания (Static Category Header) */}
        <NavGroup
          title="Предсказания"
          icon={<Sparkles size={14} className="text-cyan-400" />}
        >
          {/* Новые */}
          <NavLink
            to="/predictions/new"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} />
              <span>Новые</span>
            </div>

            {hasUnreadNewRequests && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {unreadRequestsCount || '!'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 red-dot-pulse" />
              </div>
            )}
          </NavLink>

          {/* Активные */}
          <NavLink
            to="/predictions/active"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Clock size={16} />
              <span>Активные</span>
            </div>
          </NavLink>

          {/* Архив */}
          <NavLink
            to="/predictions/archive"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Archive size={16} />
              <span>Архив</span>
            </div>
          </NavLink>
        </NavGroup>

        {/* Group 2: Финансы (Static Category Header) */}
        <NavGroup
          title="Финансы"
          icon={<Coins size={14} className="text-emerald-400" />}
        >
          {/* Инфо */}
          <NavLink
            to="/finances/info"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Wallet size={16} />
              <span>Инфо</span>
            </div>
          </NavLink>

          {/* Транзакции */}
          <NavLink
            to="/finances/transactions"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight size={16} />
              <span>Транзакции</span>
            </div>
          </NavLink>

          {/* Вывод средств */}
          <NavLink
            to="/finances/withdrawals"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Send size={16} />
              <span>Вывод средств</span>
            </div>

            {hasUnreadWithdrawals && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {unreadWithdrawalsCount || '!'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 red-dot-pulse" />
              </div>
            )}
          </NavLink>
        </NavGroup>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
        <span className="font-mono text-[11px]">v1.0.4-admin</span>
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Offline
          </span>
        )}
      </div>
    </aside>
  );
};

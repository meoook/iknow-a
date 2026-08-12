import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Sparkles,
  Send,
  ChevronDown,
  Users,
  Clock,
  Archive,
  Wallet,
  Activity,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useSignOutMutation } from '../../services/adminApi';
import { useClickOutside } from '../../hooks/useClickOutside';

const routeConfig: Record<string, { title: string; icon: React.ElementType; color: string }> = {
  '/': { title: 'Панель управления', icon: Sparkles, color: 'text-cyan-400' },
  '/users': { title: 'Пользователи', icon: Users, color: 'text-indigo-400' },
  '/predictions/new': { title: 'Новые предсказания', icon: Sparkles, color: 'text-cyan-400' },
  '/predictions/active': { title: 'Активные предсказания', icon: Clock, color: 'text-emerald-400' },
  '/predictions/archive': { title: 'Архив предсказаний', icon: Archive, color: 'text-slate-400' },
  '/finances/info': { title: 'Состояние банка', icon: Wallet, color: 'text-emerald-400' },
  '/finances/transactions': { title: 'Транзакции', icon: Activity, color: 'text-blue-400' },
  '/finances/withdrawals': { title: 'Запросы на вывод средств', icon: Send, color: 'text-rose-400' },
};

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppSelector((state) => state.auth.user);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signOut] = useSignOutMutation();

  const userMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(userMenuRef, () => setShowUserMenu(false), showUserMenu);

  const handleLogout = async () => {
    try {
      await signOut().unwrap();
    } catch (e) {
      // Ignored if offline
    }
    dispatch(logout());
    navigate('/login');
  };

  const getRouteInfo = (pathname: string) => {
    if (pathname.startsWith('/predictions/new/')) {
      return { title: 'Модерация предсказания', icon: Sparkles, color: 'text-cyan-400' };
    }
    return routeConfig[pathname] || {
      title: 'Панель управления',
      icon: Sparkles,
      color: 'text-cyan-400',
    };
  };

  const currentRoute = getRouteInfo(location.pathname);
  const RouteIcon = currentRoute.icon;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Active Page Title & Icon */}
      <div className="flex items-center gap-2.5">
        <RouteIcon className={`w-5 h-5 ${currentRoute.color}`} />
        <h1 className="text-base md:text-lg font-extrabold text-white tracking-tight">
          {currentRoute.title}
        </h1>
      </div>

      {/* Right Action Icons: User Profile Menu */}
      <div className="flex items-center gap-3">
        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.username}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {user?.is_superuser ? 'Superuser' : 'Administrator'}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-semibold text-slate-200">{user?.username}</div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {user?.is_superuser ? 'Superuser' : 'Administrator'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors mt-1 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Выйти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

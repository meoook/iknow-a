import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  LogOut,
  Bell,
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
import {
  simulateNewPredictionWsEvent,
  simulateNewWithdrawalWsEvent,
} from '../../services/websocketSimulator';
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
  const isConnected = useAppSelector((state) => state.websocket.isConnected);
  const history = useAppSelector((state) => state.websocket.history);

  const [showSimMenu, setShowSimMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEventsLog, setShowEventsLog] = useState(false);

  const [signOut] = useSignOutMutation();

  // Refs for click outside detection
  const simMenuRef = useRef<HTMLDivElement>(null);
  const eventsLogRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(simMenuRef, () => setShowSimMenu(false), showSimMenu);
  useClickOutside(eventsLogRef, () => setShowEventsLog(false), showEventsLog);
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

      {/* Right Action Icons: WS Simulator, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* WebSocket Event Simulator Button */}
        <div className="relative" ref={simMenuRef}>
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Zap size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Симулятор WS</span>
          </button>

          {showSimMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                Симуляция WS событий
              </div>
              <button
                onClick={() => {
                  simulateNewPredictionWsEvent();
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-cyan-400" />
                <span>+ Заявка на предсказание</span>
              </button>
              <button
                onClick={() => {
                  simulateNewWithdrawalWsEvent();
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send size={14} className="text-rose-400" />
                <span>+ Запрос на вывод средств</span>
              </button>
            </div>
          )}
        </div>

        {/* Real-time WS Events Drawer Button */}
        <div className="relative" ref={eventsLogRef}>
          <button
            onClick={() => setShowEventsLog(!showEventsLog)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors relative cursor-pointer"
            title="Лог событий WebSocket"
          >
            <Bell size={18} />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 red-dot-pulse" />
            )}
          </button>

          {showEventsLog && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Лог событий Realtime</span>
                <span className="text-[10px] text-slate-500 font-mono">{history.length} событий</span>
              </div>
              {history.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">Событий пока нет</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.slice(0, 5).map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono"
                    >
                      <div className="text-cyan-400 font-bold">{evt.type}</div>
                      <div className="text-slate-400 text-[10px]">{evt.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wifi,
  Zap,
  LogOut,
  Bell,
  Sparkles,
  Send,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import {
  simulateNewPredictionWsEvent,
  simulateNewWithdrawalWsEvent,
} from '../../services/websocketSimulator';
import { useSignOutMutation } from '../../services/adminApi';
import { useClickOutside } from '../../hooks/useClickOutside';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left title / Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
          <Wifi
            size={14}
            className={isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}
          />
          <span className="font-medium text-slate-300">WebSocket:</span>
          <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
            {isConnected ? 'Подключен (Realtime)' : 'Отключен'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* WS Simulator Button */}
        <div className="relative" ref={simMenuRef}>
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all shadow-sm shadow-cyan-500/10"
            title="Эмулятор входящих событий по WebSocket"
          >
            <Zap size={14} className="text-cyan-400" />
            <span>Симулятор WebSocket</span>
            <ChevronDown size={14} />
          </button>

          {showSimMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Сгенерировать live-событие
              </div>
              <button
                onClick={() => {
                  simulateNewPredictionWsEvent();
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors mt-1"
              >
                <Sparkles size={14} className="text-cyan-400" />
                <div>
                  <div className="font-medium">Новое предсказание</div>
                  <div className="text-[10px] text-slate-400">Подсветит «Новые» красной точкой</div>
                </div>
              </button>

              <button
                onClick={() => {
                  simulateNewWithdrawalWsEvent();
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Send size={14} className="text-emerald-400" />
                <div>
                  <div className="font-medium">Запрос на вывод средств</div>
                  <div className="text-[10px] text-slate-400">Подсветит «Вывод средств»</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Live Event Log Drawer Toggle */}
        <div className="relative" ref={eventsLogRef}>
          <button
            onClick={() => setShowEventsLog(!showEventsLog)}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors"
            title="История вебсокет событий"
          >
            <Bell size={16} />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {showEventsLog && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">История WS событий</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  {history.length} событий
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500">
                    Событий пока не поступало
                  </div>
                ) : (
                  history.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-mono text-cyan-400 font-semibold">{ev.type}</span>
                        <span>{ev.timestamp}</span>
                      </div>
                      <div className="text-slate-300 truncate font-mono text-[11px]">
                        {ev.payload?.title || ev.payload?.id || 'Новое событие'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-1" />

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
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
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-semibold text-slate-200">{user?.username}</div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {user?.is_superuser ? 'Superuser' : 'Administrator'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors mt-1"
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

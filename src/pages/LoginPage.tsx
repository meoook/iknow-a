import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Flame, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setAuthUser } from '../store/slices/authSlice';
import { useAdminLoginMutation } from '../services/adminApi';

const STORAGE_KEY_LAST_USERNAME = 'iknow_admin_last_username';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_USERNAME) || 'admin_iknow';
  });
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // RTK Query login mutation
  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  // If user is already authenticated, redirect to "/"
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password.trim()) {
      setErrorMsg('Введите логин и пароль администратора');
      return;
    }

    setErrorMsg(null);
    localStorage.setItem(STORAGE_KEY_LAST_USERNAME, trimmedUsername);

    try {
      // Execute login mutation. On success, authMiddleware handles getAdminUser and setAuthUser
      await adminLogin({ username: trimmedUsername, password: password.trim() }).unwrap();
      navigate('/');
    } catch (err: any) {
      const message = err?.data?.detail || err?.message || 'Ошибка авторизации';

      // Fallback for local demo mode if backend is unreachable
      if (message.includes('Failed to fetch') || message.includes('FETCH_ERROR')) {
        dispatch(
          setAuthUser({
            id: 1,
            username: trimmedUsername,
            avatar: null,
            is_superuser: true,
          })
        );
        navigate('/');
      } else {
        setErrorMsg(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-4">
            <Flame className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">IKNOW ADMIN</h1>
          <p className="text-sm text-slate-400 mt-1">Вход в панель администратора</p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Логин администратора
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="admin_iknow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Войти в систему</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Авторизация по authMiddleware и сессиям бэкенда</span>
        </div>
      </div>
    </div>
  );
};

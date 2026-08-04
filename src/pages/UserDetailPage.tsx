import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  KeyRound,
  Copy,
  Check,
  Globe,
  MessageSquare,
  TrendingUp,
  X,
  Clock,
  Laptop,
  Wallet,
  Mail,
  Send,
  QrCode,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  toggleUserActive,
  toggleUserWithdrawBlocked,
  toggleUserStaff,
  toggleUserSuperuser,
  changeUserPassword,
} from '../store/slices/usersSlice';
import {
  useGetAdminUserQuery,
  useGetAdminUserByIdQuery,
  useGetAdminUserIpsQuery,
  useGetAdminUserCommentsQuery,
  useGetAdminUserBetsQuery,
  useGetAdminUserWalletsQuery,
  useUpdateAdminUserMutation,
} from '../services/adminApi';

import { IUserItem } from '../types';
import { formatDisplayDate } from '../utils/dates';

// Subcomponent for Lightweight Charts Balance Chart (Static, No Scroll, No Logo)
const BalanceChart: React.FC<{ data: { time: string; value: number }[] }> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.2)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.2)' },
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 220,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      topColor: 'rgba(16, 185, 129, 0.35)',
      bottomColor: 'rgba(16, 185, 129, 0.01)',
      lineColor: '#10b981',
      lineWidth: 2,
    });

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartContainerRef.current.clientWidth > 0) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-[220px] relative [&_a]:!hidden"
    />
  );
};

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const userId = Number(id);

  const { data: loggedAdminUser } = useGetAdminUserQuery();

  // Search across ALL cached getAdminUsersList queries (including search queries like ?search=alex)
  const cachedUserFromList = useAppSelector((state) => {
    const queries = (state as any).adminApi?.queries || {};
    for (const key in queries) {
      if (key.startsWith('getAdminUsersList(') && queries[key]?.data) {
        const data = queries[key].data;
        const items = Array.isArray(data) ? data : data?.results;
        const found = items?.find((u: any) => u.id === userId);
        if (found) return found;
      }
    }
    return undefined;
  });

  const { data: apiDetailUser, isLoading: isDetailLoading } = useGetAdminUserByIdQuery(userId, {
    skip: !userId || Boolean(cachedUserFromList),
  });
  const { data: apiIps, isLoading: isIpsLoading } = useGetAdminUserIpsQuery(userId, { skip: !userId });
  const { data: apiComments, isLoading: isCommentsLoading } = useGetAdminUserCommentsQuery(userId, { skip: !userId });
  const { data: apiBets, isLoading: isBetsLoading } = useGetAdminUserBetsQuery(userId, { skip: !userId });
  const { data: apiWallets, isLoading: isWalletsLoading } = useGetAdminUserWalletsQuery(userId, { skip: !userId });
  const [updateAdminUser] = useUpdateAdminUserMutation();
  const isSuperuserLogged = loggedAdminUser?.is_superuser === true;

  const reduxUser = useAppSelector((state) =>
    state.users.users.find((u) => u.id === userId)
  );

  const effectiveUser = cachedUserFromList || apiDetailUser;

  const user: IUserItem | undefined = effectiveUser
    ? {
      id: effectiveUser.id,
      username: effectiveUser.username,
      email: effectiveUser.email || reduxUser?.email,
      address: effectiveUser.address || reduxUser?.address,
      balance: effectiveUser.balance !== undefined ? effectiveUser.balance : (reduxUser?.balance || 0),
      is_active: effectiveUser.is_active !== undefined ? effectiveUser.is_active : (reduxUser?.is_active ?? true),
      withdraw_blocked: effectiveUser.withdraw_blocked !== undefined ? effectiveUser.withdraw_blocked : (reduxUser?.withdraw_blocked ?? false),
      is_staff: effectiveUser.is_staff !== undefined ? effectiveUser.is_staff : (reduxUser?.is_staff ?? false),
      is_superuser: effectiveUser.is_superuser !== undefined ? effectiveUser.is_superuser : (reduxUser?.is_superuser ?? false),
      created: effectiveUser.created !== undefined ? effectiveUser.created : (reduxUser?.created || 0),
      telegram_id: effectiveUser.telegram_id || reduxUser?.telegram_id,
    }
    : reduxUser
      ? {
        id: reduxUser.id,
        username: reduxUser.username,
        email: reduxUser.email,
        address: reduxUser.address,
        balance: reduxUser.balance || 0,
        is_active: reduxUser.is_active ?? true,
        withdraw_blocked: reduxUser.withdraw_blocked ?? false,
        is_staff: reduxUser.is_staff ?? false,
        is_superuser: reduxUser.is_superuser ?? false,
        created: reduxUser.created || 0,
        telegram_id: reduxUser.telegram_id,
      }
      : undefined;

  // Sub-resource lists from API (with fallback to Redux mock data)
  const ipLogs = apiIps && apiIps.length > 0
    ? apiIps
    : ((reduxUser as any)?.recentIps || []).map((item: any, idx: number) => ({
      id: idx + 1,
      ip: item.ip,
      last_used: item.timestamp,
    }));

  const commentsList = apiComments && apiComments.length > 0
    ? apiComments
    : ((reduxUser as any)?.recentMessages || []).map((item: any, idx: number) => ({
      id: idx + 1,
      prediction: item.topic,
      text: item.message,
      created: item.timestamp,
    }));

  const betsList = apiBets && apiBets.length > 0
    ? apiBets
    : ((reduxUser as any)?.recentBets || []).map((item: any, idx: number) => ({
      id: idx + 1,
      prediction: item.predictionTitle,
      choice: item.choice,
      amount: item.amount,
      multiplier: item.multiplier,
      payout: item.payout || 0,
      state: item.status,
      created: item.timestamp,
    }));

  const walletsList = apiWallets && apiWallets.length > 0
    ? apiWallets
    : ((reduxUser as any)?.depositWallets || []).map((item: any, idx: number) => ({
      id: idx + 1,
      address: item.address,
      chain: item.chain,
    }));

  const balanceHistory: { time: string; value: number }[] = (reduxUser as any)?.balanceHistory || [];
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const isLoading = isDetailLoading && !user;

  if (isLoading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <span className="text-sm font-semibold text-slate-400">Загрузка данных пользователя...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <XCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Пользователь не найден</h2>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleToggleActive = () => {
    dispatch(toggleUserActive(user.id));
    updateAdminUser({ id: user.id, is_active: !user.is_active }).unwrap().catch(() => { });
  };

  const handleToggleWithdrawBlocked = () => {
    dispatch(toggleUserWithdrawBlocked(user.id));
    updateAdminUser({ id: user.id, withdraw_blocked: !user.withdraw_blocked }).unwrap().catch(() => { });
  };

  const handleToggleStaff = () => {
    if (!isSuperuserLogged) return;
    dispatch(toggleUserStaff(user.id));
    updateAdminUser({ id: user.id, is_staff: !user.is_staff }).unwrap().catch(() => { });
  };

  const handleToggleSuperuser = () => {
    if (!isSuperuserLogged) return;
    dispatch(toggleUserSuperuser(user.id));
    updateAdminUser({ id: user.id, is_superuser: !user.is_superuser }).unwrap().catch(() => { });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim()) {
      dispatch(changeUserPassword({ userId: user.id, newPassword }));
      updateAdminUser({ id: user.id, password: newPassword }).unwrap().catch(() => { });
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsPasswordModalOpen(false);
      }, 1500);
    }
  };

  const chartData = balanceHistory && balanceHistory.length > 0
    ? balanceHistory
    : [
      { time: '2026-07-01', value: user.balance * 0.6 },
      { time: '2026-07-10', value: user.balance * 0.75 },
      { time: '2026-07-20', value: user.balance * 0.9 },
      { time: '2026-08-03', value: user.balance },
    ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Назад к списку</span>
        </Link>

        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-md"
        >
          <KeyRound size={14} />
          <span>Сменить пароль</span>
        </button>
      </div>

      {/* Main Profile Header & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): User Avatar & Details Column */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-6 shadow-xl">
          {/* Avatar & Username Row */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center font-black text-xl text-cyan-400 shrink-0 shadow-lg">
              {user.username[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-100">@{user.username}</h1>
                <span className="text-xs text-slate-500 font-mono">ID: #{user.id}</span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                {user.is_superuser && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase">
                    <ShieldAlert size={10} />
                    <span>Superuser</span>
                  </span>
                )}
                {user.is_staff && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase">
                    <span>Staff</span>
                  </span>
                )}
                {user.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={10} />
                    <span>Активен</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                    <XCircle size={10} />
                    <span>Заблокирован</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Info Fields - Vertical Column (В столбик) */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Основная информация аккаунта
            </h3>

            <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden text-xs">
              {/* Email Row */}
              <div className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Mail size={14} className="text-cyan-400" />
                  <span>Почта (Email)</span>
                </div>
                <div className="font-mono text-slate-200">
                  {user.email ? (
                    <span>{user.email}</span>
                  ) : (
                    <span className="text-slate-500 italic">Не указана</span>
                  )}
                </div>
              </div>

              {/* Telegram Row */}
              <div className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Send size={14} className="text-cyan-400" />
                  <span>Telegram ID</span>
                </div>
                <div className="font-mono text-slate-200">
                  {user.telegram_id ? (
                    <span>@{user.telegram_id}</span>
                  ) : (
                    <span className="text-slate-500 italic">Не привязан</span>
                  )}
                </div>
              </div>

              {/* Login Address Row */}
              <div className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <QrCode size={14} className="text-cyan-400" />
                  <span>Адрес для входа (Login Wallet)</span>
                </div>
                <div className="font-mono text-slate-200">
                  {user.address ? (
                    <div
                      onClick={() => handleCopy(user.address!)}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 px-3 py-1 rounded-lg cursor-pointer transition-all group"
                      title="Кликните в любом месте, чтобы скопировать адрес"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-xs text-xs">{user.address}</span>
                      {copiedText === user.address ? (
                        <Check size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Copy size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Не привязан</span>
                  )}
                </div>
              </div>

              {/* Date Joined Row */}
              <div className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <Clock size={14} className="text-cyan-400" />
                  <span>Дата регистрации</span>
                </div>
                <div className="font-mono text-slate-200">
                  {formatDisplayDate(user.created)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Admin Action Controls & Toggles */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-center">
          <div>
            <div className="space-y-3">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 text-xs block">Активен (isActive)</span>
                  <span className="text-[10px] text-slate-400">
                    {user.is_active ? 'Разрешен вход' : 'Заблокирован'}
                  </span>
                </div>
                <button
                  onClick={handleToggleActive}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${user.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Withdraw Blocked Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 text-xs block">Запрет вывода</span>
                  <span className="text-[10px] text-slate-400">
                    {user.withdraw_blocked ? 'Вывод заблокирован' : 'Вывод разрешен'}
                  </span>
                </div>
                <button
                  onClick={handleToggleWithdrawBlocked}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${user.withdraw_blocked ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.withdraw_blocked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Staff Toggle */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!isSuperuserLogged ? 'opacity-50' : ''}`}>
                <div>
                  <span className="font-bold text-slate-200 text-xs block">Персонал (is_staff)</span>
                  <span className="text-[10px] text-slate-400">
                    {user.is_staff ? 'Доступ к админке' : 'Обычный юзер'}
                    {!isSuperuserLogged && ' (Нужен Superuser)'}
                  </span>
                </div>
                <button
                  disabled={!isSuperuserLogged}
                  onClick={handleToggleStaff}
                  title={!isSuperuserLogged ? 'Только суперпользователь может менять роль персонала' : ''}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isSuperuserLogged
                      ? 'cursor-not-allowed bg-slate-800'
                      : user.is_staff
                        ? 'bg-cyan-500 cursor-pointer'
                        : 'bg-slate-700 cursor-pointer'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.is_staff ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Superuser Toggle */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!isSuperuserLogged ? 'opacity-50' : ''}`}>
                <div>
                  <span className="font-bold text-slate-200 text-xs block">Суперпользователь</span>
                  <span className="text-[10px] text-slate-400">
                    {user.is_superuser ? 'Полные права' : 'Ограничен'}
                    {!isSuperuserLogged && ' (Нужен Superuser)'}
                  </span>
                </div>
                <button
                  disabled={!isSuperuserLogged}
                  onClick={handleToggleSuperuser}
                  title={!isSuperuserLogged ? 'Только суперпользователь может менять роль суперпользователя' : ''}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isSuperuserLogged
                      ? 'cursor-not-allowed bg-slate-800'
                      : user.is_superuser
                        ? 'bg-purple-500 cursor-pointer'
                        : 'bg-slate-700 cursor-pointer'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.is_superuser ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Block Grid: Balance Chart & Deposit Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Block (2/3 width): Balance & Static Balance History Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Текущий баланс пользователя</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
              ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Static Lightweight-Charts Area Series */}
          <div className="pt-2">
            <BalanceChart data={chartData} />
          </div>
        </div>

        {/* Right / Side Block (1/3 width): Deposit Wallets Column (В столбик) */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Адреса для пополнения</span>
            </h3>

            {/* Vertical Column List of Deposit Wallets */}
            <div className="space-y-3">
              {isWalletsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-[11px]">Загрузка адресов...</span>
                </div>
              ) : walletsList.length > 0 ? (
                walletsList.map((w: any) => (
                  <div key={w.id || w.address} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400">{w.chain}</span>
                    </div>
                    <div
                      onClick={() => handleCopy(w.address)}
                      className="flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer transition-all group"
                    >
                      <span className="truncate max-w-[180px] text-[11px] text-slate-200">{w.address}</span>
                      {copiedText === w.address ? (
                        <Check size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Copy size={12} className="text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Адреса пополнения пока не сгенерированы
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Blocks Grid (5-8 items per block) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block 1: Recent IP Addresses */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Последние IP адреса</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{ipLogs.length} логов</span>
          </div>

          <div className="space-y-3">
            {isIpsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-[11px]">Загрузка IP логов...</span>
              </div>
            ) : ipLogs.length > 0 ? (
              ipLogs.map((ipItem: any) => (
                <div key={ipItem.id || ipItem.ip} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-400">{ipItem.ip}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatDisplayDate(ipItem.last_used)}</span>
                  </div>
                  {ipItem.device && <div className="text-[11px] text-slate-300">{ipItem.device}</div>}
                  {ipItem.location && <div className="text-[10px] text-slate-400">{ipItem.location}</div>}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">История IP пуста</div>
            )}
          </div>
        </div>

        {/* Block 2: Comments Activity */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Последние комментарии</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{commentsList.length} коммент.</span>
          </div>

          <div className="space-y-3">
            {isCommentsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="text-[11px]">Загрузка комментариев...</span>
              </div>
            ) : commentsList.length > 0 ? (
              commentsList.map((msg: any) => (
                <div key={msg.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400 truncate max-w-[180px]">{msg.prediction}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatDisplayDate(msg.created)}</span>
                  </div>
                  <p className="text-xs text-slate-200 italic">"{msg.text}"</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">Нет комментариев</div>
            )}
          </div>
        </div>

        {/* Block 3: Bet Activity */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Активность ставок</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{betsList.length} ставок</span>
          </div>

          <div className="space-y-3">
            {isBetsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="text-[11px]">Загрузка ставок...</span>
              </div>
            ) : betsList.length > 0 ? (
              betsList.map((bet: any) => (
                <div key={bet.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">{bet.prediction}</span>
                    {bet.state === 'WIN' ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">WIN</span>
                    ) : bet.state === 'LOSS' ? (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">LOSS</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{bet.state || 'ACTIVE'}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{bet.choice}</span>
                    <span className="font-bold text-slate-100">${bet.amount} {bet.multiplier && <span className="text-slate-500 text-[10px]">({bet.multiplier}x)</span>}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right font-mono">{formatDisplayDate(bet.created)}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">История ставок пуста</div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <KeyRound size={18} />
                <span>Сменить пароль @{user.username}</span>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Введите новый пароль для пользователя:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Новый сложный пароль..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {passwordSuccess && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <Check size={14} />
                  <span>Пароль успешно обновлен!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Сохранить пароль
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

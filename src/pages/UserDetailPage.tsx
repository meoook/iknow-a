import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  toggleUserActive,
  toggleUserWithdrawBlocked,
  toggleUserStaff,
  toggleUserSuperuser,
  changeUserPassword,
} from '../store/slices/usersSlice';

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

  const user = useAppSelector((state) =>
    state.users.users.find((u) => u.id === userId)
  );

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!user) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <XCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Пользователь не найден</h2>
        <p className="text-sm text-slate-400">
          Пользователь с ID #{id} не существует или был удален.
        </p>
        <Link
          to="/users"
          className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-cyan-500/20 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Вернуться к списку пользователей</span>
        </Link>
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
  };

  const handleToggleWithdrawBlocked = () => {
    dispatch(toggleUserWithdrawBlocked(user.id));
  };

  const handleToggleStaff = () => {
    dispatch(toggleUserStaff(user.id));
  };

  const handleToggleSuperuser = () => {
    dispatch(toggleUserSuperuser(user.id));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim()) {
      dispatch(changeUserPassword({ userId: user.id, newPassword }));
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsPasswordModalOpen(false);
      }, 1500);
    }
  };

  // Default mock balance history if user balanceHistory is absent
  const chartData = user.balanceHistory && user.balanceHistory.length > 0
    ? user.balanceHistory
    : [
        { time: '2026-07-01', value: user.balanceUsd * 0.6 },
        { time: '2026-07-10', value: user.balanceUsd * 0.75 },
        { time: '2026-07-20', value: user.balanceUsd * 0.9 },
        { time: '2026-08-03', value: user.balanceUsd },
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
          <span>Назад к списку пользователей</span>
        </Link>

        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <KeyRound size={16} />
          <span>Сменить пароль</span>
        </button>
      </div>

      {/* Main User Profile & Info Columns */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-6 shadow-xl">
        {/* Avatar & Header Title */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center font-black text-xl text-cyan-400 shrink-0 shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">@{user.username}</h1>
              <span className="text-xs text-slate-500 font-mono">ID: #{user.id}</span>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              {user.isSuperuser && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase">
                  <ShieldAlert size={10} />
                  <span>Superuser</span>
                </span>
              )}
              {user.isStaff && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase">
                  <span>Staff</span>
                </span>
              )}
              {user.isActive ? (
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
            <div className="p-3.5 flex items-center justify-between gap-4">
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
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Send size={14} className="text-cyan-400" />
                <span>Telegram ID</span>
              </div>
              <div className="font-mono text-slate-200">
                {user.telegramId ? (
                  <span>@{user.telegramId}</span>
                ) : (
                  <span className="text-slate-500 italic">Не привязан</span>
                )}
              </div>
            </div>

            {/* Login Address Row */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <QrCode size={14} className="text-cyan-400" />
                <span>Адрес для входа (Login Wallet)</span>
              </div>
              <div className="font-mono text-slate-200">
                {user.loginAddress ? (
                  <div
                    onClick={() => handleCopy(user.loginAddress!)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg cursor-pointer transition-all group"
                    title="Кликните в любом месте, чтобы скопировать адрес"
                  >
                    <span className="truncate max-w-[240px] sm:max-w-md text-xs">{user.loginAddress}</span>
                    {copiedText === user.loginAddress ? (
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
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Clock size={14} className="text-cyan-400" />
                <span>Дата регистрации</span>
              </div>
              <div className="font-mono text-slate-200">
                {user.createdAt}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Controls & Toggles (Moved above Balance Chart) */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Права и настройки доступа пользователя</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 text-xs block">Активен (isActive)</span>
              <span className="text-[10px] text-slate-400">
                {user.isActive ? 'Разрешен вход' : 'Заблокирован'}
              </span>
            </div>
            <button
              onClick={handleToggleActive}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                user.isActive ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Withdraw Blocked Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 text-xs block">Запрет вывода</span>
              <span className="text-[10px] text-slate-400">
                {user.withdrawBlocked ? 'Вывод заблокирован' : 'Вывод разрешен'}
              </span>
            </div>
            <button
              onClick={handleToggleWithdrawBlocked}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                user.withdrawBlocked ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.withdrawBlocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Staff Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 text-xs block">Персонал (is_staff)</span>
              <span className="text-[10px] text-slate-400">
                {user.isStaff ? 'Доступ к админке' : 'Обычный юзер'}
              </span>
            </div>
            <button
              onClick={handleToggleStaff}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                user.isStaff ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.isStaff ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Superuser Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 text-xs block">Суперпользователь</span>
              <span className="text-[10px] text-slate-400">
                {user.isSuperuser ? 'Полные права' : 'Ограничен'}
              </span>
            </div>
            <button
              onClick={handleToggleSuperuser}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                user.isSuperuser ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.isSuperuser ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row: Balance Block & Chart (Left) + Deposit Wallets Column (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Block (2/3 width): Balance & Static Balance History Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Текущий баланс пользователя</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
                ${user.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-mono bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Снимки баланса</div>
              <div className="text-emerald-400 font-bold">История активна</div>
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
              {user.depositWallets && user.depositWallets.length > 0 ? (
                user.depositWallets.map((wallet, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">{wallet.chain}</div>
                    <div
                      onClick={() => handleCopy(wallet.address)}
                      className="flex items-center justify-between gap-2 font-mono text-xs text-slate-200 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 p-2.5 rounded-lg cursor-pointer transition-all group"
                      title="Кликните в любом месте, чтобы скопировать адрес"
                    >
                      <span className="truncate">{wallet.address}</span>
                      {copiedText === wallet.address ? (
                        <Check size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Copy size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Адреса пополнения не сгенерированы
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
            <span className="text-[10px] font-mono text-slate-500">{user.recentIps?.length || 0} логов</span>
          </div>

          <div className="space-y-3">
            {user.recentIps && user.recentIps.length > 0 ? (
              user.recentIps.map((ipItem) => (
                <div key={ipItem.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-400">{ipItem.ip}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ipItem.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{ipItem.device}</div>
                  <div className="text-[10px] text-slate-400">{ipItem.location}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">История IP пуста</div>
            )}
          </div>
        </div>

        {/* Block 2: Message Activity */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl glass-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Активность сообщений</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{user.recentMessages?.length || 0} сообщ.</span>
          </div>

          <div className="space-y-3">
            {user.recentMessages && user.recentMessages.length > 0 ? (
              user.recentMessages.map((msg) => (
                <div key={msg.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400">{msg.topic}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 italic">"{msg.message}"</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">Нет сообщений</div>
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
            <span className="text-[10px] font-mono text-slate-500">{user.recentBets?.length || 0} ставок</span>
          </div>

          <div className="space-y-3">
            {user.recentBets && user.recentBets.length > 0 ? (
              user.recentBets.map((bet) => (
                <div key={bet.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">{bet.predictionTitle}</span>
                    {bet.status === 'WIN' ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">WIN</span>
                    ) : bet.status === 'LOSS' ? (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">LOSS</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">PENDING</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{bet.choice}</span>
                    <span className="font-bold text-slate-100">${bet.amount} <span className="text-slate-500 text-[10px]">({bet.multiplier}x)</span></span>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right font-mono">{bet.timestamp}</div>
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

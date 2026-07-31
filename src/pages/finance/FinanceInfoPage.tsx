import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  ShieldCheck,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useAppSelector } from '../../store';

export const FinanceInfoPage: React.FC = () => {
  const bankInfo = useAppSelector((state) => state.finance.bankInfo);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 glass-panel">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-400" />
            <span>Финансовое состояние банка</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Агрегированный баланс банка, распределение по блокчейн-кошелькам и показатели ликвидности.
          </p>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel relative">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Общий баланс банка (USD)
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${bankInfo.bankTotalBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Горячие кошельки: ${bankInfo.hotWalletsUsd.toLocaleString()}</span>
            <span>Холодные: ${bankInfo.coldWalletsUsd.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel relative">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Коэффициент резервирования
          </span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {bankInfo.reserveRatio}%
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-emerald-400 flex items-center gap-1">
            <ShieldCheck size={14} />
            <span>Полное покрытие депозитов пользователей (100% Solvency)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl glass-panel relative">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Суточный оборот (24h Volume)
          </span>
          <div className="text-3xl font-extrabold text-white font-mono">
            ${bankInfo.twentyFourHourVolumeUsd.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp size={14} className="text-cyan-400" />
            <span>Стабильный поток ликвидности</span>
          </div>
        </div>
      </div>

      {/* Blockchain Bank Wallets List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Адреса кошельков банка в блокчейнах</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {bankInfo.wallets.length} активных сетей
          </span>
        </div>

        <div className="space-y-4">
          {bankInfo.wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-sm font-bold text-white">{wallet.chain}</span>
                    <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                      {wallet.chainType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {wallet.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
                    <span className="truncate max-w-xs md:max-w-md">{wallet.address}</span>
                    <button
                      onClick={() => handleCopy(wallet.address, wallet.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Копировать адрес"
                    >
                      {copiedId === wallet.id ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-xs text-slate-400">Нативный баланс:</div>
                    <div className="text-sm font-bold font-mono text-slate-200">
                      {wallet.nativeBalance}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">Токен (USDT/USDC):</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {wallet.tokenBalance}
                    </div>
                  </div>

                  <div className="pl-4 border-l border-slate-800">
                    <div className="text-xs text-slate-400">USD Оценка:</div>
                    <div className="text-base font-extrabold font-mono text-white">
                      ${wallet.usdValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

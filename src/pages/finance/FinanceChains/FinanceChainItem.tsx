import React, { useState } from 'react';
import {
  Coins,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { IFinanceChain, IFinanceToken, TChainType } from '../../../types';
import { ChainBalanceState } from '../../../hooks/useChainBalances';
import { ChainBalanceService } from '../../../services/chainBalanceService';
import { FinanceTokenItem } from './FinanceTokenItem';

interface FinanceChainItemProps {
  chain: IFinanceChain;
  balanceState?: ChainBalanceState;
  isSuperuser: boolean;
  onToggleChain: (chainId: number, active: boolean) => void;
  onToggleToken: (tokenId: number, active: boolean) => void;
  onRefreshNative: (chain: IFinanceChain) => void;
  onRefreshToken: (chain: IFinanceChain, token: IFinanceToken) => void;
}

export const FinanceChainItem: React.FC<FinanceChainItemProps> = React.memo(({
  chain,
  balanceState,
  isSuperuser,
  onToggleChain,
  onToggleToken,
  onRefreshNative,
  onRefreshToken,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getChainBadgeStyle = (chainType: string) => {
    const type = chainType?.toUpperCase();
    const baseStyle = 'font-mono text-[10px] px-2.5 py-0.5 rounded-md font-bold border';
    if (type === TChainType.EVM) return `${baseStyle} bg-cyan-950/60 text-cyan-300 border-cyan-700/60`;
    if (type === TChainType.TVM) return `${baseStyle} bg-rose-950/60 text-rose-300 border-rose-700/60`;
    if (type === TChainType.SVM) return `${baseStyle} bg-purple-950/60 text-purple-300 border-purple-700/60`;
    return `${baseStyle} bg-slate-800/90 text-slate-300 border-slate-700/60`;
  };

  const isSupported = ChainBalanceService.isSupported(chain);
  const isNativeLoading = isSupported && (balanceState?.isNativeLoading ?? false);

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${chain.active
        ? 'bg-slate-950/70 border-slate-800/90 shadow-md'
        : 'bg-slate-950/40 border-slate-800/40 opacity-75'
        }`}
    >
      {/* Chain Card Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm text-cyan-400 shrink-0 shadow-sm">
            {chain.name.slice(0, 3).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-slate-100">{chain.name}</span>
              <span className={getChainBadgeStyle(chain.chain_type)}>{chain.chain_type}</span>
              {chain.coin && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {chain.coin}
                </span>
              )}
              {chain.chain_id && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  ID: {chain.chain_id}
                </span>
              )}
              {chain.scan_url && (
                <a
                  href={chain.scan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Открыть Explorer сети"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Bank Address in Chain */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Wallet size={12} className="text-emerald-400" />
                <span>Адрес банка:</span>
              </span>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-0.5 rounded-lg text-xs font-mono text-slate-300">
                <span className="truncate max-w-[180px] sm:max-w-xs">{chain.address || '—'}</span>
                {chain.address && (
                  <button
                    onClick={() => handleCopy(chain.address, `chain-${chain.id}`)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Скопировать адрес"
                  >
                    {copiedKey === `chain-${chain.id}` ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Native Balance & Expenses & Active Toggle */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
          {/* Bank Balance (Native) */}
          <div className="text-left lg:text-right">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 lg:justify-end">
              <span>Баланс банка</span>
              {isSupported && (
                <button
                  onClick={() => onRefreshNative(chain)}
                  disabled={isNativeLoading}
                  className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Обновить нативный баланс этой сети"
                >
                  <RefreshCw
                    size={10}
                    className={isNativeLoading ? 'animate-spin text-cyan-400' : ''}
                  />
                </button>
              )}
            </div>

            <div
              className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5 lg:justify-end"
              title={
                isSupported
                  ? balanceState?.nativeError || balanceState?.native || 'Загрузка...'
                  : 'Прямой баланс через RPC доступен для сетей EVM, Tron и Solana'
              }
            >
              {isSupported ? (
                isNativeLoading ? (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-sans">
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>Загрузка...</span>
                  </span>
                ) : balanceState?.nativeError ? (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                    <AlertCircle size={13} />
                    <span>Ошибка RPC</span>
                  </span>
                ) : (
                  <span>
                    {ChainBalanceService.formatBalance(balanceState?.native)} {chain.coin}
                  </span>
                )
              ) : (
                <span>0.00 {chain.coin}</span>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="text-left lg:text-right pl-4 border-l border-slate-800/60">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Расходы (комиссии)
            </div>
            <div className="text-sm font-extrabold font-mono text-amber-400 mt-0.5">
              {chain.expenses !== undefined
                ? `${chain.expenses.toLocaleString('en-US', {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 6,
                })} ${chain.coin}`
                : `0.00 ${chain.coin}`}
            </div>
          </div>

          {/* Chain Active Toggle */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-300 block">
                {chain.active ? 'Активна' : 'Отключена'}
              </span>
              <span className="text-[10px] text-slate-400">
                {chain.active ? 'Сеть доступна' : 'Депозиты закрыты'}
              </span>
            </div>

            <button
              disabled={!isSuperuser}
              onClick={() => onToggleChain(chain.id, !chain.active)}
              title={!isSuperuser ? 'Только суперадмин может менять статус сети' : ''}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isSuperuser
                ? 'cursor-not-allowed opacity-50 bg-slate-800'
                : chain.active
                  ? 'bg-cyan-500 cursor-pointer'
                  : 'bg-slate-700 cursor-pointer'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${chain.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tokens Section for Chain */}
      <div className="p-5 space-y-3 bg-slate-950/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Coins size={14} className="text-cyan-400" />
            <span>Токены сети ({chain.tokens?.length || 0})</span>
          </span>
        </div>

        {!chain.tokens || chain.tokens.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            В данной сети пока не настроены токены
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {chain.tokens.map((token) => (
              <FinanceTokenItem
                key={token.id}
                token={token}
                chain={chain}
                tokenState={isSupported ? balanceState?.tokens?.[token.id] : undefined}
                isSupported={isSupported}
                isSuperuser={isSuperuser}
                onToggleToken={onToggleToken}
                onRefreshToken={onRefreshToken}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { IFinanceChain, IFinanceToken } from '../../../types';
import { TokenBalanceState } from '../../../hooks/useChainBalances';
import { ChainBalanceService } from '../../../services/chainBalanceService';

interface FinanceTokenItemProps {
  token: IFinanceToken;
  chain: IFinanceChain;
  tokenState?: TokenBalanceState;
  isSupported: boolean;
  isSuperuser: boolean;
  onToggleToken: (tokenId: number, active: boolean) => void;
  onRefreshToken: (chain: IFinanceChain, token: IFinanceToken) => void;
}

export const FinanceTokenItem: React.FC<FinanceTokenItemProps> = React.memo(({
  token,
  chain,
  tokenState,
  isSupported,
  isSuperuser,
  onToggleToken,
  onRefreshToken,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTokenLoading = isSupported && (tokenState?.isLoading ?? false);
  const tokenRawBal = tokenState?.balance;
  const tokenErr = tokenState?.error;

  const getTokenExplorerUrl = () => {
    if (!chain.scan_url) return null;
    if (chain.chain_type === 'TVM') return `${chain.scan_url}/#/token20/${token.address}`;
    if (chain.chain_type === 'SVM') return `${chain.scan_url}/address/${token.address}`;
    return `${chain.scan_url}/token/${token.address}`;
  };

  const explorerUrl = getTokenExplorerUrl();

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
        token.active
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-slate-900/40 border-slate-800/40 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-100 font-mono">
              {token.currency}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                token.active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {token.active ? 'Active' : 'Disabled'}
            </span>
          </div>

          {/* Token Contract Address */}
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-slate-400">
            <span className="truncate" title={token.address}>
              {token.address}
            </span>
            <button
              onClick={() => handleCopy(token.address)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Скопировать адрес смарт-контракта"
            >
              {copied ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
            </button>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors ml-1"
                title="Посмотреть в блокчейн-эксплорере"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Token Active Toggle Switch */}
        <div className="flex items-center">
          <button
            disabled={!isSuperuser}
            onClick={() => onToggleToken(token.id, !token.active)}
            title={!isSuperuser ? 'Только суперадмин может менять статус токена' : ''}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              !isSuperuser
                ? 'cursor-not-allowed opacity-50 bg-slate-800'
                : token.active
                ? 'bg-emerald-500 cursor-pointer'
                : 'bg-slate-700 cursor-pointer'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                token.active ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Token Balances & Parameters Footer */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">
              Баланс банка
            </span>
            {isSupported && (
              <button
                onClick={() => onRefreshToken(chain, token)}
                disabled={isTokenLoading}
                className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                title={`Обновить баланс токена ${token.currency}`}
              >
                <RefreshCw
                  size={9}
                  className={isTokenLoading ? 'animate-spin text-cyan-400' : ''}
                />
              </button>
            )}
          </div>

          <span
            className="font-extrabold text-emerald-400 flex items-center gap-1 mt-0.5"
            title={isSupported ? tokenErr || tokenRawBal || 'Загрузка...' : undefined}
          >
            {isSupported ? (
              isTokenLoading ? (
                <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] font-sans">
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>Загрузка...</span>
                </span>
              ) : tokenErr ? (
                <span className="text-amber-400/90 text-[11px]">—</span>
              ) : (
                <span>
                  {ChainBalanceService.formatBalance(tokenRawBal)} {token.currency}
                </span>
              )
            ) : (
              <span>0.00 {token.currency}</span>
            )}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
            Мин. ввод / Decimals
          </span>
          <span className="text-slate-300">
            {token.minimum} {token.currency} ({token.decimals}d)
          </span>
        </div>
      </div>
    </div>
  );
});

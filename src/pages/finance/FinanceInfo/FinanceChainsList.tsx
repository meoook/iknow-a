import React, { useState } from 'react';
import {
  Network,
  Coins,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { IFinanceChain } from '../../../types';

interface FinanceChainsListProps {
  chains: IFinanceChain[];
  isSuperuser: boolean;
  onToggleChain: (chainId: number, active: boolean) => void;
  onToggleToken: (tokenId: number, active: boolean) => void;
}

export const FinanceChainsList: React.FC<FinanceChainsListProps> = ({
  chains,
  isSuperuser,
  onToggleChain,
  onToggleToken,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 glass-panel space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>Блокчейн сети и токены платформы</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Мониторинг сетей, смарт-контрактов токенов и балансов системных кошельков банка
          </p>
        </div>

        {!isSuperuser && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
            <ShieldAlert size={14} />
            <span>Управление статусами сетей доступно только Суперадмину</span>
          </div>
        )}
      </div>

      {/* Chains List */}
      <div className="space-y-6">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className={`rounded-2xl border transition-all overflow-hidden ${chain.active
              ? 'bg-slate-950/70 border-slate-800/90 shadow-md'
              : 'bg-slate-950/40 border-slate-800/40 opacity-75'
              }`}
          >
            {/* Chain Card Header */}
            <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-cyan-400 shrink-0 shadow-sm">
                  {chain.name.slice(0, 3).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-slate-100">{chain.name}</span>
                    <span className="bg-slate-800/90 text-slate-300 font-mono text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-slate-700/60">
                      {chain.chain_type}
                    </span>
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

              {/* Right Side: Native Balance & Active Toggle */}
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
                <div className="text-left lg:text-right">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Нативный баланс банка
                  </div>
                  <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
                    0.00 {chain.coin || chain.name}
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
                    <div
                      key={token.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${token.active
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
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${token.active
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
                              onClick={() => handleCopy(token.address, `token-${token.id}`)}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Скопировать адрес смарт-контракта"
                            >
                              {copiedKey === `token-${token.id}` ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                            {chain.scan_url && (
                              <a
                                href={`${chain.scan_url}/token/${token.address}`}
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
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${!isSuperuser
                              ? 'cursor-not-allowed opacity-50 bg-slate-800'
                              : token.active
                                ? 'bg-emerald-500 cursor-pointer'
                                : 'bg-slate-700 cursor-pointer'
                              }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${token.active ? 'translate-x-4' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Token Balances & Parameters Footer */}
                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                            Баланс банка
                          </span>
                          <span className="font-extrabold text-emerald-400">
                            0.00 {token.currency}
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
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

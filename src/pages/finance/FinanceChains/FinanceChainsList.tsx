import React from 'react';
import { Network, ShieldAlert, RefreshCw } from 'lucide-react';
import { IFinanceChain } from '../../../types';
import { useChainBalances } from '../../../hooks/useChainBalances';
import { FinanceChainItem } from './FinanceChainItem';

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
  const {
    balances,
    isGlobalFetching,
    refetchAll,
    refreshChainNative,
    refreshToken,
  } = useChainBalances(chains);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 glass-panel space-y-6 shadow-xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>Блокчейн сети и токены платформы</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Мониторинг сетей, смарт-контрактов токенов и балансов системных кошельков банка (EVM, Tron, Solana)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh All Balances Button */}
          <button
            onClick={refetchAll}
            disabled={isGlobalFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Обновить балансы всех сетей и токенов"
          >
            <RefreshCw size={13} className={isGlobalFetching ? 'animate-spin' : ''} />
            <span>{isGlobalFetching ? 'Обновление...' : 'Обновить все балансы'}</span>
          </button>

          {!isSuperuser && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
              <ShieldAlert size={14} />
              <span>Управление статусами сетей доступно только Суперадмину</span>
            </div>
          )}
        </div>
      </div>

      {/* Chains List */}
      <div className="space-y-6">
        {chains.map((chain) => (
          <FinanceChainItem
            key={chain.id}
            chain={chain}
            balanceState={balances[chain.id]}
            isSuperuser={isSuperuser}
            onToggleChain={onToggleChain}
            onToggleToken={onToggleToken}
            onRefreshNative={refreshChainNative}
            onRefreshToken={refreshToken}
          />
        ))}
      </div>
    </div>
  );
};

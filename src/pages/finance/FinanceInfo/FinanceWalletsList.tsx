import React, { useState } from 'react';
import { Wallet, Copy, Check } from 'lucide-react';

interface WalletItem {
  id: string;
  chain: string;
  chainType: string;
  status: string;
  address: string;
  nativeBalance: string;
  tokenBalance: string;
  usdValue: number;
}

interface FinanceWalletsListProps {
  wallets: WalletItem[];
}

export const FinanceWalletsList: React.FC<FinanceWalletsListProps> = ({ wallets }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 glass-panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <span>Адреса кошельков банка в блокчейнах</span>
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          {wallets.length} активных сетей
        </span>
      </div>

      <div className="space-y-4">
        {wallets.map((wallet) => (
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
  );
};

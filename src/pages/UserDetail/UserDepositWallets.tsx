import React from 'react';
import { Globe, Copy, Check, Loader2 } from 'lucide-react';

interface UserDepositWalletsProps {
  isLoading: boolean;
  walletsList: any[];
  copiedText: string | null;
  onCopy: (text: string) => void;
}

export const UserDepositWallets: React.FC<UserDepositWalletsProps> = ({
  isLoading,
  walletsList,
  copiedText,
  onCopy,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Адреса для пополнения</span>
        </h3>

        <div className="space-y-3">
          {isLoading ? (
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
                  onClick={() => onCopy(w.address)}
                  className="flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer transition-all group"
                >
                  <span className="truncate pr-1 text-[11px] text-slate-200">{w.address}</span>
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
  );
};

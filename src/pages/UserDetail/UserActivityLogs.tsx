import React from 'react';
import { Laptop, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dates';

interface UserActivityLogsProps {
  isIpsLoading: boolean;
  ipLogs: any[];
  isCommentsLoading: boolean;
  commentsList: any[];
  isBetsLoading: boolean;
  betsList: any[];
}

export const UserActivityLogs: React.FC<UserActivityLogsProps> = ({
  isIpsLoading,
  ipLogs,
  isCommentsLoading,
  commentsList,
  isBetsLoading,
  betsList,
}) => {
  return (
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
  );
};

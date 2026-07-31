import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAppSelector } from '../../store';

export const TransactionsPage: React.FC = () => {
  const transactions = useAppSelector((state) => state.finance.transactions);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.user.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      tx.chain.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesDirection =
      filterDirection === 'ALL' || tx.direction === filterDirection;

    return matchesSearch && matchesDirection;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 glass-panel">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-emerald-400" />
            <span>Транзакции на ввод и вывод средств</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            История всех финансовых операций ввода (депозитов) и вывода средств пользователей.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по хэшу, пользователю или сети..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Фильтр:</span>
          <button
            onClick={() => setFilterDirection('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterDirection === 'ALL'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilterDirection('IN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterDirection === 'IN'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            Ввод (IN)
          </button>
          <button
            onClick={() => setFilterDirection('OUT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterDirection === 'OUT'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            Вывод (OUT)
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Тип / Направление</th>
                <th className="py-3.5 px-4">Пользователь</th>
                <th className="py-3.5 px-4">Сумма & Токен</th>
                <th className="py-3.5 px-4">Сеть</th>
                <th className="py-3.5 px-4">Хэш транзакции (TxHash)</th>
                <th className="py-3.5 px-4">Статус</th>
                <th className="py-3.5 px-4 text-right">Время</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Транзакций по вашему запросу не найдено
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {tx.direction === 'IN' ? (
                          <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <ArrowDownLeft size={14} />
                          </span>
                        ) : (
                          <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <ArrowUpRight size={14} />
                          </span>
                        )}
                        <span className="font-bold text-slate-200">
                          {tx.direction === 'IN' ? 'Депозит' : 'Вывод'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                      @{tx.user}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={
                          tx.direction === 'IN' ? 'text-emerald-400' : 'text-slate-200'
                        }
                      >
                        {tx.direction === 'IN' ? '+' : '-'}${tx.amount.toLocaleString()} {tx.token}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">{tx.chain}</td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      <div className="flex items-center gap-1 max-w-[180px] truncate" title={tx.txHash}>
                        <span className="truncate">{tx.txHash}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {tx.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={12} />
                          <span>Успешно</span>
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <Clock size={12} />
                          <span>В обработке</span>
                        </span>
                      )}
                      {tx.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          <XCircle size={12} />
                          <span>Отклонено</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      {tx.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

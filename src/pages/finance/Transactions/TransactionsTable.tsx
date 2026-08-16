import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { IExternalTxItem } from '../../../types';

import { formatDisplayDate } from '../../../utils/dates';

interface TransactionsTableProps {
  filteredTx: IExternalTxItem[];
}


export const TransactionsTable: React.FC<TransactionsTableProps> = ({ filteredTx }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Направление</th>
              <th className="py-3.5 px-4">Пользователь</th>
              <th className="py-3.5 px-4">Сумма</th>
              <th className="py-3.5 px-4">Сеть</th>
              <th className="py-3.5 px-4">Хэш (TxHash)</th>
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
                        <span className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <ArrowUpRight size={14} />
                        </span>
                      )}
                      <span className="font-bold text-slate-200">
                        {tx.direction === 'IN' ? 'Депозит' : 'Вывод'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                    <Link
                      to={`/users/${tx.user.id}`}
                      className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
                    >
                      @{tx.user.username}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className={tx.direction === 'IN' ? 'text-emerald-400' : 'text-rose-400'}>
                      {tx.direction === 'IN' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.token.currency}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">{tx.token.chain}</td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    <div className="flex items-center gap-1 max-w-[180px] truncate" title={tx.tx_id || undefined}>
                      {tx.url ? (
                        <a
                          href={tx.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
                        >
                          {tx.tx_id || '-'}
                        </a>
                      ) : (
                        <span className="truncate">{tx.tx_id || '-'}</span>
                      )}
                    </div>
                  </td>


                  <td className="py-3.5 px-4">
                    {(tx.status === 'COMPLETED' || tx.status === 'APPROVED') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={12} />
                        <span>{tx.status === 'COMPLETED' ? 'Успешно' : 'Одобрено'}</span>
                      </span>
                    )}
                    {(tx.status === 'PENDING' || tx.status === 'PROCESSING' || tx.status === 'SUBMITTED') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <Clock size={12} />
                        <span>В обработке</span>
                      </span>
                    )}
                    {(tx.status === 'FAILED' || tx.status === 'REJECTED') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                        <XCircle size={12} />
                        <span>{tx.status === 'REJECTED' ? 'Отклонено' : 'Ошибка'}</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {formatDisplayDate(tx.created)}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


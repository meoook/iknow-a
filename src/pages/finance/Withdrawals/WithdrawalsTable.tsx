import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ExternalTxStatus, IExternalTxItem } from '../../../types';
import { formatDisplayDate } from '../../../utils/dates';

interface WithdrawalsTableProps {
  withdrawals: IExternalTxItem[];
  isSuperuser: boolean;
  onOpenModal: (w: IExternalTxItem) => void;
  onConfirmReject: (id: number) => void;
}

export const WithdrawalsTable: React.FC<WithdrawalsTableProps> = ({
  withdrawals,
  isSuperuser,
  onOpenModal,
  onConfirmReject,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Сумма</th>
              <th className="py-3.5 px-4">Пользователь</th>
              <th className="py-3.5 px-4">Сеть</th>
              <th className="py-3.5 px-4">Адрес</th>
              <th className="py-3.5 px-4">Время создания</th>
              <th className="py-3.5 px-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Очередь запросов на вывод пуста
                </td>
              </tr>
            ) : (
              withdrawals.map((wreq) => (
                <tr key={wreq.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Сумма */}
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                    <span>
                      ${wreq.amount.toLocaleString()} {wreq.token.currency}
                    </span>
                  </td>

                  {/* Пользователь */}
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    <Link
                      to={`/users/${wreq.user.id}`}
                      className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
                    >
                      @{wreq.user.username}
                    </Link>
                  </td>

                  {/* Сеть */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {wreq.token.chain}
                  </td>

                  {/* Адрес */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 max-w-[200px] truncate" title={wreq.address}>
                    {wreq.address ?? '-'}
                  </td>

                  {/* Время создания */}
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {formatDisplayDate(wreq.created)}
                  </td>

                  {/* Кнопки Принять / Отклонить */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={!isSuperuser || wreq.status !== ExternalTxStatus.PENDING}
                        onClick={() => onConfirmReject(wreq.id)}
                        className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title={!isSuperuser ? 'Требуются права Superuser' : ''}
                      >
                        <XCircle size={14} />
                        <span>Отклонить</span>
                      </button>

                      <button
                        disabled={!isSuperuser || wreq.status !== 'PENDING'}
                        onClick={() => onOpenModal(wreq)}
                        className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title={!isSuperuser ? 'Требуются права Superuser' : ''}
                      >
                        <CheckCircle2 size={14} />
                        <span>Принять</span>
                      </button>
                    </div>
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

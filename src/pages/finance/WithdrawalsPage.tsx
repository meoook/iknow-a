import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  CheckCircle2,
  XCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  approveWithdrawal,
  rejectWithdrawal,
  clearWithdrawalsBadge,
} from '../../store/slices/financeSlice';
import { IWithdrawalRequestItem } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

export const WithdrawalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const withdrawals = useAppSelector((state) => state.finance.withdrawals);
  const hasUnread = useAppSelector((state) => state.finance.hasUnreadWithdrawals);
  const currentUser = useAppSelector((state) => state.auth.user);

  const isSuperuser = currentUser?.is_superuser ?? true; // Default to true if not specified in mock

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IWithdrawalRequestItem | null>(null);
  const [manualTxHash, setManualTxHash] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setSelectedWithdrawal(null), !!selectedWithdrawal);

  useEffect(() => {
    if (hasUnread) {
      dispatch(clearWithdrawalsBadge());
    }
  }, [hasUnread, dispatch]);

  const handleOpenModal = (w: IWithdrawalRequestItem) => {
    if (!isSuperuser) return;
    setSelectedWithdrawal(w);
    setManualTxHash('');
  };

  const handleCloseModal = () => {
    setSelectedWithdrawal(null);
  };

  const handleConfirmApprove = () => {
    if (selectedWithdrawal && isSuperuser) {
      dispatch(
        approveWithdrawal({
          id: selectedWithdrawal.id,
          txHash: manualTxHash.trim() || undefined,
        })
      );
      handleCloseModal();
    }
  };

  const handleConfirmReject = (id: string) => {
    if (!isSuperuser) return;
    dispatch(rejectWithdrawal(id));
    if (selectedWithdrawal?.id === id) {
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Send className="w-6 h-6 text-rose-400" />
              <span>Запросы на вывод средств</span>
            </h1>
            {withdrawals.length > 0 && (
              <span className="bg-rose-500/20 text-rose-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                {withdrawals.length} в очереди
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Запросы на вывод средств, ожидающие подтверждения администратора.
          </p>
        </div>

        {!isSuperuser && (
          <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Подтверждение выплат ограничено (требуются права Superuser)</span>
          </div>
        )}
      </div>

      {/* Withdrawals Table */}
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
                      <div className="flex items-center gap-2">
                        {wreq.hasUnreadWsEvent && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 red-dot-pulse shrink-0"
                            title="Новое событие WebSocket"
                          />
                        )}
                        <span>
                          ${wreq.amount.toLocaleString()} {wreq.token}
                        </span>
                      </div>
                    </td>

                    {/* Пользователь */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      @{wreq.user.username}
                    </td>

                    {/* Сеть */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {wreq.chain}
                    </td>

                    {/* Адрес */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 max-w-[200px] truncate" title={wreq.address}>
                      {wreq.address}
                    </td>

                    {/* Время создания */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {wreq.created}
                    </td>

                    {/* Кнопки Принять / Отклонить */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={!isSuperuser}
                          onClick={() => handleConfirmReject(wreq.id)}
                          className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={!isSuperuser ? 'Требуются права Superuser' : ''}
                        >
                          <XCircle size={14} />
                          <span>Отклонить</span>
                        </button>

                        <button
                          disabled={!isSuperuser}
                          onClick={() => handleOpenModal(wreq)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* Approval Confirmation Modal */}
      {selectedWithdrawal && isSuperuser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Подтверждение выплаты средств</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 mb-1">Получатель и сумма:</div>
                <div className="text-base font-extrabold text-white font-mono">
                  ${selectedWithdrawal.amount.toLocaleString()} {selectedWithdrawal.token}
                </div>
                <div className="text-slate-300 mt-1">@{selectedWithdrawal.user.username}</div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Хэш транзакции блокчейна (необязательно, сгенерируется автоматически):
                </label>
                <input
                  type="text"
                  value={manualTxHash}
                  onChange={(e) => setManualTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-3 py-2 rounded-lg font-semibold text-slate-400 hover:text-slate-200"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
              >
                Подтвердить отправку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

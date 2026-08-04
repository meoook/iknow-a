import React, { useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { IWithdrawalRequestItem } from '../../../types';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface WithdrawalApprovalModalProps {
  selectedWithdrawal: IWithdrawalRequestItem | null;
  isSuperuser: boolean;
  manualTxHash: string;
  onManualTxHashChange: (val: string) => void;
  onClose: () => void;
  onConfirmApprove: () => void;
}

export const WithdrawalApprovalModal: React.FC<WithdrawalApprovalModalProps> = ({
  selectedWithdrawal,
  isSuperuser,
  manualTxHash,
  onManualTxHashChange,
  onClose,
  onConfirmApprove,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, !!selectedWithdrawal);

  if (!selectedWithdrawal || !isSuperuser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={18} />
            <span>Подтверждение выплаты средств</span>
          </div>
          <button
            onClick={onClose}
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
              onChange={(e) => onManualTxHashChange(e.target.value)}
              placeholder="0x..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={onConfirmApprove}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Подтвердить отправку
          </button>
        </div>
      </div>
    </div>
  );
};

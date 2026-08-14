import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, X, Check, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useCheckUsernameQuery } from '../../services/adminApi';
import { useClickOutside } from '../../hooks/useClickOutside';

interface UserUsernameModalProps {
  isOpen: boolean;
  currentUsername: string;
  userId: number;
  onUpdateSuccess: (newUsername: string) => void;
  onSubmitUsername: (newUsername: string) => Promise<void>;
  onClose: () => void;
}

export const UserUsernameModal: React.FC<UserUsernameModalProps> = ({
  isOpen,
  currentUsername,
  onSubmitUsername,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [newUsername, setNewUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewUsername('');
      setDebouncedUsername('');
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(newUsername.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [newUsername]);

  const trimmed = newUsername.trim();
  const isSameAsCurrent = trimmed.toLowerCase() === currentUsername.toLowerCase();
  const isTooShort = trimmed.length > 0 && trimmed.length < 4;
  const shouldCheck = debouncedUsername.length >= 4 && !isSameAsCurrent;

  const { data: checkData, isFetching: isChecking, error: checkError } = useCheckUsernameQuery(
    debouncedUsername,
    { skip: !shouldCheck }
  );

  const isAvailable = shouldCheck && !isChecking && checkData?.available === true && !checkError;
  const isTaken = shouldCheck && !isChecking && (checkData?.available === false || !!checkError);
  const isTypingDebounce = trimmed.length >= 4 && trimmed !== debouncedUsername;

  const canSubmit = isAvailable && !isSubmitting && !submitSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmitUsername(trimmed);
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const errMsg = err?.data?.detail || err?.data?.username?.[0] || 'Не удалось обновить username';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <UserCheck size={18} />
            <span>Сменить username @{currentUsername}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Введите новый username:
            </label>
            <div className="relative">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setSubmitError(null);
                }}
                placeholder="Новый username (например, satoshi)"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-colors ${
                  isAvailable
                    ? 'border-emerald-500/60 focus:border-emerald-400'
                    : isTaken || isTooShort
                    ? 'border-rose-500/60 focus:border-rose-400'
                    : 'border-slate-800 focus:border-cyan-500'
                }`}
              />
              <div className="absolute right-3 top-2.5">
                {(isChecking || isTypingDebounce) && (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
                {!isChecking && !isTypingDebounce && isAvailable && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {!isChecking && !isTypingDebounce && isTaken && (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </div>

            {/* Validation & Feedback Status */}
            <div className="mt-2 min-h-[20px] text-xs">
              {trimmed === '' && (
                <span className="text-slate-500">Минимум 4 символа (латиница, цифры, подчеркивания)</span>
              )}
              {isSameAsCurrent && trimmed !== '' && (
                <span className="text-amber-400/90 flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>Это текущий username пользователя</span>
                </span>
              )}
              {isTooShort && (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>Слишком короткий (минимум 4 символа)</span>
                </span>
              )}
              {(isChecking || isTypingDebounce) && (
                <span className="text-cyan-400 flex items-center gap-1">
                  <span>Проверка доступности...</span>
                </span>
              )}
              {!isChecking && !isTypingDebounce && isAvailable && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Username свободен</span>
                </span>
              )}
              {!isChecking && !isTypingDebounce && isTaken && (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle size={13} />
                  <span>Username уже занят</span>
                </span>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {submitSuccess && (
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Check size={14} />
              <span>Username успешно обновлен!</span>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle size={14} />
              <span>{submitError}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <span>Сохранить username</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, Loader2, Check } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useUpdatePredictionDatesMutation } from '../../services/adminApi';
import { IPredictionItem } from '../../types';

interface UpdateDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: IPredictionItem;
}

export const UpdateDatesModal: React.FC<UpdateDatesModalProps> = ({
  isOpen,
  onClose,
  prediction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [endDate, setEndDate] = useState<string>('');
  const [betDate, setBetDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [updateDates, { isLoading }] = useUpdatePredictionDatesMutation();

  useEffect(() => {
    if (isOpen && prediction) {
      setEndDate(prediction.end_date ? String(prediction.end_date).slice(0, 10) : '');
      setBetDate(prediction.bet_date ? String(prediction.bet_date).slice(0, 10) : '');
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen, prediction]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!endDate) {
      setError('Укажите дату завершения события');
      return;
    }

    if (betDate && betDate > endDate) {
      setError('Дата окончания приема ставок не может быть позже даты завершения');
      return;
    }

    try {
      await updateDates({
        predictionId: prediction.id,
        end_date: endDate,
        bet_date: betDate || undefined,
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.end_date || err?.data?.bet_date || 'Не удалось обновить даты';
      setError(String(msg));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Изменение сроков</h3>
              <p className="text-xs text-slate-400">Событие #{prediction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={16} className="shrink-0" />
              <span>Сроки успешно обновлены!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Дата завершения (end_date) <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Дата подведения итогов и определения результата.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Дата окончания ставок (bet_date)
            </label>
            <input
              type="date"
              value={betDate}
              onChange={(e) => setBetDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Если не указано, автоматически установится за 1 день до даты завершения.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              <span>Сохранить</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

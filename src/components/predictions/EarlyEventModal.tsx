import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, AlertTriangle, Loader2, Check } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEarlyEventFinishMutation } from '../../services/adminApi';
import { IPredictionItem } from '../../types';

interface EarlyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: IPredictionItem;
  onSuccess?: () => void;
}

const formatDateTimeLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

const getLocalTzOffset = () => {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return minutes > 0 ? `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}` : `UTC${sign}${hours}`;
};

export const EarlyEventModal: React.FC<EarlyEventModalProps> = ({
  isOpen,
  onClose,
  prediction,
  onSuccess,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [eventTime, setEventTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const [earlyEventFinish, { isLoading }] = useEarlyEventFinishMutation();

  const now = new Date();
  const maxDateTime = formatDateTimeLocal(now);

  const createdDate = prediction?.created ? new Date(prediction.created * 1000) : new Date();
  const minDateTime = formatDateTimeLocal(createdDate);

  useEffect(() => {
    if (isOpen) {
      setEventTime(maxDateTime);
      setError(null);
      setResultMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!eventTime) {
      setError('Укажите дату и время наступления события');
      return;
    }

    const selectedDate = new Date(eventTime);
    if (selectedDate > new Date()) {
      setError('Время события не может быть в будущем');
      return;
    }

    if (prediction.created && selectedDate < new Date(prediction.created * 1000)) {
      setError('Время события не может быть раньше создания прогноза');
      return;
    }

    try {
      const res = await earlyEventFinish({
        predictionId: prediction.id,
        event_time: selectedDate.toISOString(),
      }).unwrap();

      const cancelledCount = res.count ?? 0;
      const cancelledAmount = (res.amount ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setResultMsg(`Событие зафиксировано! Отменено ставок: ${cancelledCount} (на сумму $${cancelledAmount})`);

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      const msg = err?.data?.detail || 'Ошибка при обработке раннего события';
      setError(String(msg));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Событие произошло раньше</h3>
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
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resultMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={16} className="shrink-0" />
              <span>{resultMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle size={14} />
              <span>Внимание!</span>
            </div>
            <p>
              Все ставки, сделанные <strong>после</strong> указанного времени, будут отменены (статус <code>CANCEL</code>),
              а средства в полном объеме вернутся пользователям на баланс с уведомлением.
            </p>
            <p className="text-slate-400">
              Прием ставок будет завершен, а событие перейдет в фазу выбора победителя.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Точное время наступления события <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                {getLocalTzOffset()}
              </span>
            </div>
            <input
              type="datetime-local"
              value={eventTime}
              max={maxDateTime}
              min={minDateTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Время не может быть в будущем или раньше даты создания прогноза.
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
              disabled={isLoading || Boolean(resultMsg)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              <span>Зафиксировать и вернуть ставки</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ExternalLink,
  User,
  AlertTriangle,
  FileText,
  X,
  BadgeCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  approveRequest,
  rejectRequest,
  regenerateIcon,
  clearNewRequestsBadge,
} from '../../store/slices/predictionsSlice';
import { IPredictionRequestItem } from '../../types';
import { REJECTION_TEMPLATES } from '../../data/mockData';
import { useClickOutside } from '../../hooks/useClickOutside';

export const NewPredictionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.predictions.requests);
  const hasUnread = useAppSelector((state) => state.predictions.hasUnreadNewRequests);

  const [selectedRequest, setSelectedRequest] = useState<IPredictionRequestItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setSelectedRequest(null), !!selectedRequest);

  // Clear red dot notification when user views this page
  useEffect(() => {
    if (hasUnread) {
      dispatch(clearNewRequestsBadge());
    }
  }, [hasUnread, dispatch]);

  const handleOpenModal = (req: IPredictionRequestItem) => {
    setSelectedRequest(req);
    setSelectedTemplate('');
    setCustomReason('');
    setIsRejecting(false);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleRegenerateIcon = (id: number) => {
    dispatch(regenerateIcon(id));
    if (selectedRequest && selectedRequest.id === id) {
      const updated = requests.find((r) => r.id === id);
      if (updated) {
        setSelectedRequest({ ...updated });
      }
    }
  };

  const handleApprove = (id: number) => {
    dispatch(approveRequest(id));
    handleCloseModal();
  };

  const handleConfirmReject = (id: number) => {
    const finalReason = customReason.trim() || selectedTemplate || 'Отклонено модератором';
    dispatch(rejectRequest({ id, reason: finalReason }));
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Subheader bar with queue count */}
      {requests.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Нажмите на карточку для открытия окна модерации</span>
          <span className="bg-cyan-500/20 text-cyan-400 font-mono px-2.5 py-1 rounded-full font-bold">
            {requests.length} в очереди
          </span>
        </div>
      )}

      {/* Requests List - Full Width Cards Container */}
      {requests.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">Очередь модерации пуста</h3>
          <p className="text-sm text-slate-400 mt-1">
            Все поступившие запросы были обработаны. Используйте симулятор WebSocket для проверки real-time событий!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => handleOpenModal(req)}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 cursor-pointer glass-panel glass-panel-hover relative group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all hover:border-cyan-500/40"
            >
              {/* Live WebSocket Event Red Dot Badge */}
              {req.hasUnreadWsEvent && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 rounded-full text-[10px] text-rose-300 font-bold z-10">
                  <span className="w-2 h-2 rounded-full bg-rose-500 red-dot-pulse" />
                  <span>Новый WS</span>
                </div>
              )}

              {/* Left & Middle Content: Larger Icon, Title, Tags, User, Bet, Choices */}
              <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                {/* Larger Icon */}
                <img
                  src={req.icon}
                  alt="Icon"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-lg group-hover:border-cyan-500/60 transition-colors"
                />

                <div className="min-w-0 flex-1 space-y-2.5">
                  {/* Tags & Title */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {req.groups.map((g, i) => (
                        <span key={i} className="bg-slate-800 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-700/60">
                          {g}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-snug">
                      {req.title}
                    </h3>
                  </div>

                  {/* User & Bet amount */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      @{req.user.username}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${req.amount.toLocaleString()} bet
                    </span>
                  </div>

                  {/* Choices preview */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Варианты ответов ({req.choices.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {req.choices.map((ch, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-800/90 text-slate-200 px-3 py-1 rounded-lg border border-slate-700/60 font-medium"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: 3 Dates Block */}
              <div className="w-full lg:w-auto shrink-0 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-row lg:flex-col justify-between gap-3 text-xs min-w-[210px] self-stretch lg:self-center">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Создано:</span>
                  </span>
                  <span className="font-mono text-slate-300">{req.created}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ставки до:</span>
                  </span>
                  <span className="font-mono text-amber-400 font-semibold">{req.betDate}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Финал:</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">{req.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Window for Moderation */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles size={16} />
                <span>Модерация заявки #{selectedRequest.id}</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Request Details */}
            <div className="mt-4 space-y-5">
              {/* Title & Icon section with Icon Regenerate Button */}
              <div className="flex items-start gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="relative group shrink-0">
                  <img
                    src={selectedRequest.icon}
                    alt="Icon"
                    className="w-16 h-16 rounded-xl object-cover border border-cyan-500/40 shadow-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerateIcon(selectedRequest.id);
                    }}
                    className="absolute -bottom-2 -right-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                    title="Перегенерировать иконку"
                  >
                    <RefreshCw size={14} className="font-bold animate-spin-hover" />
                  </button>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {selectedRequest.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <button
                      onClick={() => handleRegenerateIcon(selectedRequest.id)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw size={12} />
                      <span>Сгенерировать другую иконку</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Автор заявки:</span>
                  <span className="text-slate-200 font-semibold font-mono">
                    @{selectedRequest.user.username} (ID: {selectedRequest.user.id})
                  </span>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Первоначальная ставка:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    ${selectedRequest.amount.toLocaleString()} USDT
                  </span>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Группы тегов:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.groups.map((g, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Дата окончания ставок:</span>
                  <span className="text-slate-200 font-mono">{selectedRequest.betDate}</span>
                </div>
              </div>

              {/* Rules & Source Link */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-cyan-400" />
                  <span>Правила и критерии подведения итогов:</span>
                </div>
                <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {selectedRequest.rules}
                </p>
                {selectedRequest.link && (
                  <a
                    href={selectedRequest.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:underline pt-1"
                  >
                    <span>Ссылка для проверки: {selectedRequest.link}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Rejection Form Drawer */}
              {isRejecting ? (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={16} />
                    <span>Укажите причину отклонения заявки</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">
                      Выберите готовый шаблон причины:
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => {
                        setSelectedTemplate(e.target.value);
                        if (e.target.value) setCustomReason(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="">-- Выбрать шаблон причины --</option>
                      {REJECTION_TEMPLATES.map((tmpl, idx) => (
                        <option key={idx} value={tmpl}>
                          {tmpl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-medium">
                      Или введите свой комментарий для пользователя:
                    </label>
                    <textarea
                      rows={2}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                      placeholder="Подробное объяснение причины..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleConfirmReject(selectedRequest.id)}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                    >
                      Подтвердить отклонение
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            {!isRejecting && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setIsRejecting(true)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <XCircle size={16} />
                  <span>Отклонить заявку</span>
                </button>

                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  <BadgeCheck size={18} />
                  <span>Подтвердить и опубликовать</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

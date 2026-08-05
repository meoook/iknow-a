import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, XCircle, BadgeCheck, AlertTriangle, UserCheck } from 'lucide-react';
import { IPredictionRequestItem } from '../../../types';
import { REJECTION_TEMPLATES } from '../../../constants/rejectionTemplates';

interface PredictionDetailStickyHeaderProps {
  req: IPredictionRequestItem;
  isRejecting: boolean;
  selectedTemplate: string;
  customReason: string;
  onSetIsRejecting: (val: boolean) => void;
  onSelectTemplate: (val: string) => void;
  onCustomReasonChange: (val: string) => void;
  onApprove: () => void;
  onConfirmReject: () => void;
}

export const PredictionDetailStickyHeader: React.FC<PredictionDetailStickyHeaderProps> = ({
  req,
  isRejecting,
  selectedTemplate,
  customReason,
  onSetIsRejecting,
  onSelectTemplate,
  onCustomReasonChange,
  onApprove,
  onConfirmReject,
}) => {
  return (
    <div className="sticky top-16 z-20 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md -mx-8 -mt-8 mb-4 shadow-2xl transition-all">
      <div className="px-9 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/predictions/new"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Назад к списку</span>
          </Link>

          {req.moderators && req.moderators.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
              <UserCheck size={14} className="text-amber-400" />
              <span>Взято в работу: @{req.moderators.join(', @')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!isRejecting ? (
            <>
              <button
                onClick={() => onSetIsRejecting(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <XCircle size={16} />
                <span>Отклонить заявку</span>
              </button>

              <button
                onClick={onApprove}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <BadgeCheck size={18} />
                <span>Подтвердить и опубликовать</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onSetIsRejecting(false)}
              className="px-4 py-2 border border-slate-700 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
            >
              Отменить отклонение
            </button>
          )}
        </div>
      </div>

      {/* Sticky Rejection Form Drawer (If rejecting) */}
      {isRejecting && (
        <div className="border-t border-rose-500/30 bg-rose-950/40 p-5 px-9 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle size={18} className="text-rose-400" />
            <span>Причина отклонения заявки #{req.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                Выберите готовый шаблон причины:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => onSelectTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
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
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                Или введите свой комментарий для пользователя:
              </label>
              <textarea
                rows={4}
                value={customReason}
                onChange={(e) => onCustomReasonChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                placeholder="Подробное объяснение причины..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-rose-500/20">
            <button
              onClick={() => onSetIsRejecting(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={onConfirmReject}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer transition-transform hover:scale-105"
            >
              Подтвердить отклонение
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

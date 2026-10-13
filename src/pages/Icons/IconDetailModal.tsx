import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Tag,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import {
  useUpdateIconMutation,
  useDeleteIconMutation,
} from '../../services/adminApi';
import { IIconBankItem } from '../../types';
import { formatIconUrl } from '../../utils/images';

interface IconDetailModalProps {
  icon: IIconBankItem | null;
  onClose: () => void;
}

export const IconDetailModal: React.FC<IconDetailModalProps> = ({
  icon,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, Boolean(icon));

  const [keywords, setKeywords] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [updateIcon, { isLoading: isUpdating }] = useUpdateIconMutation();
  const [deleteIcon, { isLoading: isDeleting }] = useDeleteIconMutation();

  useEffect(() => {
    if (icon) {
      setKeywords(icon.keywords || '');
      setErrorMsg(null);
      setIsSaved(false);
    }
  }, [icon]);

  if (!icon) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaved(false);

    try {
      await updateIcon({
        id: icon.id,
        keywords: keywords.trim(),
      }).unwrap();
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 800);
    } catch (err: any) {
      const msg = err?.data?.keywords?.[0] || err?.data?.detail || 'Не удалось сохранить ключевые слова';
      setErrorMsg(String(msg));
    }
  };

  const isOlderThanOneHour = Math.floor(Date.now() / 1000) >= icon.created + 3600;
  const canDelete = icon.is_tmp && isOlderThanOneHour;

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    setErrorMsg(null);

    try {
      await deleteIcon(icon.id).unwrap();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.detail || 'Не удалось удалить иконку';
      setErrorMsg(String(msg));
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
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Иконка #{icon.id}</h3>
              <p className="text-xs text-slate-400">
                Стиль: <span className="font-mono text-cyan-400 uppercase">{icon.style}</span> • Использований: {icon.usage_count}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={16} className="shrink-0" />
              <span>Ключевые слова успешно обновлены!</span>
            </div>
          )}

          {/* Image Preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              <img
                src={formatIconUrl(icon.image)}
                alt={icon.prompt || `Icon #${icon.id}`}
                className="w-full h-full object-cover"
              />
              {icon.is_tmp && (
                <span className="absolute top-2 left-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                  tmp
                </span>
              )}
            </div>
            {icon.prompt && (
              <p className="text-xs text-slate-400 text-center max-w-md line-clamp-2" title={icon.prompt}>
                {icon.prompt}
              </p>
            )}
          </div>

          {/* Keywords Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-cyan-400" />
              <span>Ключевые слова (keywords):</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isUpdating || isDeleting}
              placeholder="Введите ключевые слова через пробел..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!canDelete || isDeleting || isUpdating}
              onClick={handleDelete}
              title={
                !icon.is_tmp
                  ? 'Удаление недоступно для постоянных иконок (is_tmp = False)'
                  : !isOlderThanOneHour
                    ? 'Удаление доступно только спустя 1 час после создания'
                    : 'Удалить временную иконку'
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-500/10"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>Удалить</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating || isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isUpdating || isDeleting || isSaved}
                className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

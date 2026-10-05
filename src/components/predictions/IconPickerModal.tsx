import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Sparkles,
  RefreshCw,
  Check,
  Image as ImageIcon,
  Tag,
  Loader2,
  Layers,
  Palette,
  AlertCircle,
} from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import {
  useGetIconsQuery,
  useGetIconStylesQuery,
  useGenerateIconMutation,
} from '../../services/adminApi';
import { IIconBankItem, IIconStyleItem } from '../../types';
import { formatIconUrl } from '../../utils/images';
import { wsManager } from '../../services/websocket';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (iconId: number) => Promise<void> | void;
  initialPrompt?: string;
  title?: string;
}

const DEFAULT_STYLES: IIconStyleItem[] = [
  { id: '3d', name: '3D Render' },
  { id: 'cartoon', name: 'Cartoon Art' },
  { id: 'photo', name: 'Realistic Photo' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon' },
  { id: 'pixelart', name: 'Pixel Art' },
  { id: 'minimalist', name: 'Minimalist Vector' },
];

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPrompt = '',
  title = 'Выбор иконки',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose, isOpen);

  const [activeTab, setActiveTab] = useState<'select' | 'generate'>('select');

  // Search & Filter state for "Выбрать" tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [selectedIcon, setSelectedIcon] = useState<IIconBankItem | null>(null);

  // State for "Сгенерировать" tab
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>('3d');
  const [keywords, setKeywords] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tmpIcon, setTmpIcon] = useState<{
    id: number;
    url: string;
    prompt: string;
    style: string;
  } | null>(null);

  // Queries & Mutations
  const { data: iconStyles = DEFAULT_STYLES } = useGetIconStylesQuery(undefined, {
    skip: !isOpen,
  });

  const {
    data: icons = [],
    isLoading: isIconsLoading,
    refetch: refetchIcons,
  } = useGetIconsQuery(
    {
      search: debouncedSearch.trim() || undefined,
      style: styleFilter !== 'all' ? styleFilter : undefined,
    },
    { skip: !isOpen }
  );

  const [generateApi] = useGenerateIconMutation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync initial prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setErrorMsg(null);
      // Pre-fill search if empty
      if (!searchQuery && initialPrompt) {
        setSearchQuery(initialPrompt);
      }
    } else {
      setSelectedIcon(null);
      setTmpIcon(null);
      setIsGenerating(false);
      setIsSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen, initialPrompt]);

  // Listen to WebSocket icon_generated event
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = wsManager.onIconGenerated((data) => {
      if (data?.success) {
        setTmpIcon({
          id: data.id,
          url: data.url,
          prompt: data.prompt,
          style: data.style,
        });
        setIsGenerating(false);
        setErrorMsg(null);
      } else if (data && !data.success) {
        setIsGenerating(false);
        setErrorMsg('Не удалось сгенерировать иконку. Попробуйте еще раз.');
      }
    });

    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle generation start
  const handleGenerate = async () => {
    const finalPrompt = prompt.trim();
    if (!finalPrompt) {
      setErrorMsg('Укажите промпт для генерации');
      return;
    }
    if (!style || isGenerating) return;

    setErrorMsg(null);
    setIsGenerating(true);
    try {
      await generateApi({
        prompt: finalPrompt,
        style,
        keywords: keywords.trim(),
        icon_id: tmpIcon?.id,
      }).unwrap();

    } catch (e: any) {
      console.error('Failed to trigger generation:', e);
      setIsGenerating(false);
      setErrorMsg('Ошибка запуска генерации');
    }
  };

  // Handle confirm selected icon from bank
  const handleConfirmSelect = async () => {
    if (!selectedIcon || isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm(selectedIcon.id);
      onClose();
    } catch (e: any) {
      console.error('Failed to attach icon:', e);
      setErrorMsg('Ошибка при сохранении выбранной иконки');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm newly generated icon
  const handleConfirmGenerated = async () => {
    if (!tmpIcon || isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm(tmpIcon.id);
      onClose();
    } catch (e: any) {
      console.error('Failed to attach generated icon:', e);
      setErrorMsg('Ошибка при сохранении сгенерированной иконки');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl relative animate-in fade-in zoom-in-95 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{title}</h2>
              <p className="text-xs text-slate-400">
                Банк иконок с поиском по тегам и генерацией через Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          <button
            onClick={() => {
              setActiveTab('select');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'select'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <Layers size={14} />
            <span>Выбрать из банка</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('generate');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'generate'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
          >
            <Sparkles size={14} />
            <span>Сгенерировать</span>
            {tmpIcon && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Tab 1: Выбрать из банка */}
        {activeTab === 'select' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search & Style Filter Toolbar */}
            <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по ключевым словам или описанию..."
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Style Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <Palette size={14} className="text-slate-400 shrink-0 hidden sm:block" />
                <select
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Все стили</option>
                  {iconStyles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[260px]">
              {isIconsLoading && icons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Поиск иконок в банке...</span>
                </div>
              ) : icons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-slate-950/30 rounded-2xl border border-slate-800/60">
                  <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    Подходящих иконок не найдено
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Попробуйте изменить запрос поиска или перейдите во вкладку «Сгенерировать»,
                    чтобы создать новую иконку.
                  </p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="mt-4 inline-flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Сгенерировать иконку</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {icons.map((item) => {
                    const isSelected = selectedIcon?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedIcon(item)}
                        onDoubleClick={() => {
                          setSelectedIcon(item);
                          handleConfirmSelect();
                        }}
                        className={`group relative bg-slate-950/60 border rounded-xl p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all ${isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900/90'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                      >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800/60">
                          <img
                            src={formatIconUrl(item.image)}
                            alt={item.prompt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-cyan-500 text-slate-950 p-1 rounded-full shadow-lg">
                              <Check size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="w-full min-w-0 text-left">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-mono text-cyan-400/80 font-bold uppercase truncate">
                              {item.style}
                            </span>
                            <span className="font-mono text-slate-500">
                              {item.usage_count} исп.
                            </span>
                          </div>
                          <p
                            className="text-[11px] font-medium text-slate-200 truncate"
                            title={item.prompt}
                          >
                            {item.prompt}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Banner for Select Tab */}
            {errorMsg && (
              <div className="mx-4 sm:mx-6 mb-3 bg-rose-500/10 border border-rose-500/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-400/80 hover:text-rose-200 transition-colors p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Bottom Bar: Action buttons for "Выбрать" */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400 truncate">
                {selectedIcon ? (
                  <span>
                    Выбрано:{' '}
                    <strong className="text-cyan-400 font-semibold">{selectedIcon.prompt}</strong>
                  </span>
                ) : (
                  <span>Выберите иконку из списка или дважды кликните по ней</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={!selectedIcon || isSubmitting}
                  onClick={handleConfirmSelect}
                  className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Применение...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Выбрать эту иконку</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Сгенерировать */}
        {activeTab === 'generate' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Error Banner for Generate Tab */}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1">{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-400/80 hover:text-rose-200 transition-colors p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                {/* Style Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Palette size={13} className="text-cyan-400" />
                    <span>Стиль изображения:</span>
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer transition-colors"
                  >
                    {iconStyles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-400" />
                      <span>Промпт для генерации:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrompt(initialPrompt);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className="text-[11px] text-cyan-400 hover:underline font-normal cursor-pointer"
                    >
                      Сбросить к исходному title
                    </button>
                  </label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    disabled={isGenerating}
                    placeholder="Например: Золотая монета Bitcoin с неоновым свечением..."
                    spellCheck={true}
                    className={`w-full bg-slate-950/80 border rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors resize-none leading-relaxed ${errorMsg
                      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50'
                      : 'border-slate-800 focus:border-cyan-500'
                      }`}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Совет: укажите суть объекта без конкретных дат и временных интервалов.
                  </p>
                </div>

                {/* Keywords / Tags Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Tag size={13} className="text-cyan-400" />
                    <span>Ключевые слова / теги (необязательно):</span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    disabled={isGenerating}
                    placeholder="биткоин btc крипта crypto"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Right Column: Preview Area (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div
                  className={`w-full max-w-[240px] aspect-square rounded-2xl bg-slate-950/90 border flex items-center justify-center p-3 relative overflow-hidden shadow-inner transition-colors ${errorMsg && !tmpIcon && !isGenerating
                    ? 'border-rose-500/50'
                    : 'border-slate-800'
                    }`}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 gap-3 animate-pulse">
                      <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-spin">
                        <RefreshCw size={24} />
                      </div>
                      <div className="text-xs font-semibold text-slate-200">
                        Генерация в процессе...
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        ИИ создает изображение и удаляет фон
                      </div>
                    </div>
                  ) : tmpIcon ? (
                    <div className="relative w-full h-full flex items-center justify-center group">
                      <img
                        src={formatIconUrl(tmpIcon.url)}
                        alt={tmpIcon.prompt}
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                        tmp
                      </div>
                    </div>
                  ) : errorMsg ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-rose-400 gap-2">
                      <AlertCircle size={28} className="text-rose-400" />
                      <div className="text-xs font-semibold">Ошибка генерации</div>
                      <div className="text-[10px] text-slate-400">
                        Попробуйте изменить промпт или стиль
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500 gap-2">
                      <Sparkles size={28} className="text-slate-600" />
                      <div className="text-xs">Здесь появится сгенерированная иконка</div>
                    </div>
                  )}
                </div>

                {tmpIcon && !isGenerating && (
                  <div className="mt-2 text-center text-[11px] text-emerald-400 font-medium">
                    ✓ Готово к привязке
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions for "Сгенерировать" */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
              >
                <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                <span>
                  {isGenerating
                    ? 'Генерация...'
                    : tmpIcon
                      ? 'Сгенерировать заново'
                      : 'Сгенерировать'}
                </span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={!tmpIcon || isGenerating || isSubmitting}
                  onClick={handleConfirmGenerated}
                  className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Сохранение...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Ок</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

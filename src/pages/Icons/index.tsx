import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Palette,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  useGetIconsQuery,
  useGetIconStylesQuery,
} from '../../services/adminApi';
import { IIconBankItem, IIconStyleItem } from '../../types';
import { formatIconUrl } from '../../utils/images';
import { formatDisplayDate } from '../../utils/dates';
import { IconDetailModal } from './IconDetailModal';

const DEFAULT_STYLES: IIconStyleItem[] = [
  { id: '3d', name: '3D Render' },
  { id: 'cartoon', name: 'Cartoon Art' },
  { id: 'photo', name: 'Realistic Photo' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon' },
  { id: 'pixelart', name: 'Pixel Art' },
  { id: 'minimalist', name: 'Minimalist Vector' },
];

export const IconsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [tmpOnly, setTmpOnly] = useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<IIconBankItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: iconStyles = DEFAULT_STYLES } = useGetIconStylesQuery();

  const { data: icons = [], isLoading } = useGetIconsQuery({
    search: debouncedSearch || undefined,
    style: styleFilter !== 'all' ? styleFilter : undefined,
    tmp_only: tmpOnly || undefined,
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 glass-panel shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ImageIcon size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white leading-tight">Банк иконок</h1>
            <p className="text-xs text-slate-400">
              Всего найдено: <span className="font-mono font-bold text-cyan-400">{icons.length}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-3xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по ключевым словам или описанию (prompt)..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
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
              className="w-full sm:w-auto bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Все стили</option>
              {iconStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tmp Only Toggle */}
          <button
            type="button"
            onClick={() => setTmpOnly((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              tmpOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock size={14} />
            <span>Только tmp</span>
          </button>
        </div>
      </div>

      {/* Icons List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden glass-panel shadow-xl">
        {isLoading && icons.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs">Загрузка иконок...</span>
          </div>
        ) : icons.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <ImageIcon className="w-12 h-12 text-slate-600" />
            <h3 className="text-base font-bold text-slate-200">Иконок не найдено</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Попробуйте изменить поисковый запрос или фильтр стиля.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-20">Иконка</th>
                  <th className="py-3.5 px-4 w-28">Style</th>
                  <th className="py-3.5 px-4">Keywords</th>
                  <th className="py-3.5 px-4">Prompt</th>
                  <th className="py-3.5 px-4 text-center w-28">Usage Count</th>
                  <th className="py-3.5 px-4 text-center w-28">Is Tmp</th>
                  <th className="py-3.5 px-5 text-right w-32">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {icons.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedIcon(item)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* 1. Миниатюра иконки */}
                    <td className="py-3 px-5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition-colors">
                        <img
                          src={formatIconUrl(item.image)}
                          alt={item.prompt || `Icon #${item.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* 2. style */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 font-mono text-[11px] font-bold text-cyan-400 uppercase">
                        {item.style}
                      </span>
                    </td>

                    {/* 3. keywords */}
                    <td className="py-3 px-4 text-slate-200 max-w-[240px]">
                      {item.keywords ? (
                        <div className="line-clamp-2 font-mono text-[11px] text-slate-300" title={item.keywords}>
                          {item.keywords}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>

                    {/* 4. prompt */}
                    <td className="py-3 px-4 text-slate-300 max-w-[320px]">
                      {item.prompt ? (
                        <div className="line-clamp-2" title={item.prompt}>
                          {item.prompt}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>

                    {/* 5. usage_count */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {item.usage_count}
                    </td>

                    {/* 6. is_tmp */}
                    <td className="py-3 px-4 text-center">
                      {item.is_tmp ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
                          <Clock size={12} />
                          <span>True</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px]">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>False</span>
                        </span>
                      )}
                    </td>

                    {/* 7. created */}
                    <td className="py-3 px-5 text-right font-mono text-slate-400 whitespace-nowrap">
                      {formatDisplayDate(item.created)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for editing keywords / deleting tmp icon */}
      <IconDetailModal
        icon={selectedIcon}
        onClose={() => setSelectedIcon(null)}
      />
    </div>
  );
};

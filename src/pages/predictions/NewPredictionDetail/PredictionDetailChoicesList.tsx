import React from 'react';
import { Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { IPredictionRequestItem } from '../../../types';

const DEFAULT_CHOICE_ICON = `${import.meta.env.VITE_IMG_URL}/tmp/no_icon.png`;

interface PredictionDetailChoicesListProps {
  req: IPredictionRequestItem;
  isGeneratingIcon?: boolean;
  onRegenerateChoiceIcon: (index: number) => void;
  onRegenerateAllChoiceIcons: () => void;
}

export const PredictionDetailChoicesList: React.FC<PredictionDetailChoicesListProps> = ({
  req,
  isGeneratingIcon,
  onRegenerateChoiceIcon,
  onRegenerateAllChoiceIcons,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-5">
      {/* Choices Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <span>Варианты ответов ({req.choices.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Нажмите иконку обновления на любом варианте или сгенерируйте новые картинки для всех исходов сразу.
          </p>
        </div>

        <button
          disabled={isGeneratingIcon}
          onClick={onRegenerateAllChoiceIcons}
          className={`flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm ${isGeneratingIcon ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <Sparkles size={15} className={isGeneratingIcon ? 'animate-spin' : ''} />
          <span>{isGeneratingIcon ? 'Генерация иконок...' : 'Сгенерировать иконки для всех вариантов'}</span>
        </button>
      </div>

      {/* 2-Column Choices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {req.choices.map((choiceTitle, idx) => {
          const currentChoiceIcon = DEFAULT_CHOICE_ICON;
          const isAuthorVote = choiceTitle === req.vote;

          return (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors group"
            >
              {/* Choice Icon with Round Refresh Button & Title */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative group/choice shrink-0">
                  <img
                    src={currentChoiceIcon}
                    alt={choiceTitle}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md group-hover:border-cyan-500/40 transition-colors"
                  />
                  <button
                    disabled={isGeneratingIcon}
                    onClick={() => onRegenerateChoiceIcon(idx)}
                    className={`absolute -bottom-1.5 -right-1.5 bg-slate-900 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 p-1.5 rounded-full shadow-lg border border-slate-700 transition-transform cursor-pointer ${isGeneratingIcon ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                      }`}
                    title="Сгенерировать другую картинку для этого варианта"
                  >
                    <RefreshCw size={12} className={`font-bold ${isGeneratingIcon ? 'animate-spin' : ''}`} />
                  </button>
                </div>


                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{choiceTitle}</span>
                    {isAuthorVote && (
                      <span className="text-amber-400 font-mono text-[10px] font-bold shrink-0">
                        (Выбор автора)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Исход #{idx + 1}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

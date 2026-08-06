import React from 'react';
import { Calendar, Award, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';
import { IPredictionItem } from '../../types';
import { formatIconUrl } from '../../utils/images';

interface PredictionCardProps {
  prediction: IPredictionItem;
  onClick: (id: number) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onClick }) => {
  const winnerChoice = prediction.choices?.find((c) => c.win === true);

  return (
    <div
      onClick={() => onClick(prediction.id)}
      className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-2xl glass-panel transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-5"
    >
      {/* Left: Icon & Main Info */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="relative shrink-0">
          <img
            src={formatIconUrl(prediction.icon)}
            alt={prediction.title}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 group-hover:border-cyan-500/40 transition-colors shadow-md"
          />
          {prediction.groups && prediction.groups.length > 0 && (
            <span className="absolute -bottom-1.5 -right-1.5 bg-slate-950/90 text-cyan-400 border border-slate-700 text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-full">
              {prediction.groups[0]}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
              {prediction.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <BarChart2 size={13} className="text-cyan-400" />
              <span>Объем: ${Number(prediction.volume || 0).toLocaleString()}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>До: {prediction.endDate || '—'}</span>
            </span>
          </div>

          {/* Choices Badges / Selected Winner */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {prediction.choices?.map((choice) => (
              <span
                key={choice.id}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors ${
                  choice.win === true
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                {choice.win === true && <CheckCircle2 size={12} className="text-emerald-400" />}
                <span>{choice.title}</span>
                <span className="text-[10px] opacity-70 font-mono">({choice.multiplier || 1.0}x)</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Action Indicator */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
        {winnerChoice ? (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Award size={14} />
            <span>Победитель выбит</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Award size={14} />
            <span>Ожидает выбора</span>
          </div>
        )}

        <div className="w-8 h-8 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};

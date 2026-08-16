import React from 'react';
import { BarChart2, Trophy, UserCheck } from 'lucide-react';
import { IPredictionItem } from '../../types';
import { formatIconUrl } from '../../utils/images';
import { PredictionDatesBlock } from './PredictionDatesBlock';

interface PredictionCardProps {
  prediction: IPredictionItem;
  onClick: (id: number) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onClick }) => {
  const winnerChoice = prediction.choices?.find((c) => c.win === true);

  return (
    <div
      onClick={() => onClick(prediction.id)}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 cursor-pointer glass-panel glass-panel-hover relative group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all hover:border-cyan-500/40"
    >
      {/* Left & Middle Content: Icon, Title, Tags, Volume, Winner, Moderators */}
      <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
        <img
          src={formatIconUrl(prediction.icon)}
          alt={prediction.title}
          className="w-16 h-16 md:w-22 md:h-22 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-lg group-hover:border-cyan-500/60 transition-colors"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {prediction.groups?.map((g, i) => (
                <span
                  key={i}
                  className="bg-slate-800 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-700/60"
                >
                  {g}
                </span>
              ))}

              {prediction.state && ['ENDED', 'CANCEL'].includes(prediction.state) && (
                <span className="bg-slate-800/90 text-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700/60">
                  {prediction.state}
                </span>
              )}
            </div>

            <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-snug">
              {prediction.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold text-sm">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>${Number(prediction.volume || 0).toLocaleString()} volume</span>
            </span>

            {winnerChoice && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                  <Trophy className="w-3 h-3 text-emerald-400" />
                  <span>Победитель: {winnerChoice.title}</span>
                </span>
              </>
            )}

            {prediction.moderators && prediction.moderators.length > 0 && (
              <>
                <span>•</span>
                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  <span>Взято в работу: @{prediction.moderators.join(', @')}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: 3 Dates Block */}
      <PredictionDatesBlock
        created={prediction.created}
        betDate={prediction.bet_date}
        endDate={prediction.end_date}
        closedDate={prediction.closed}
      />
    </div>
  );
};

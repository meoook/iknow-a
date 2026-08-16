import React from 'react';
import { User, UserCheck } from 'lucide-react';
import { IPredictionRequestItem } from '../../../types';
import { formatIconUrl } from '../../../utils/images';
import { PredictionDatesBlock } from '../../../components/predictions/PredictionDatesBlock';

interface NewPredictionCardProps {
  req: IPredictionRequestItem;
  onClick: (id: number) => void;
}

export const NewPredictionCard: React.FC<NewPredictionCardProps> = ({ req, onClick }) => {
  return (
    <div
      onClick={() => onClick(req.id)}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 cursor-pointer glass-panel glass-panel-hover relative group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all hover:border-cyan-500/40"
    >
      {/* Left & Middle Content: Icon, Title, Tags, User, Bet */}
      <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
        <img
          src={formatIconUrl(req.icon)}
          alt="Icon"
          className="w-16 h-16 md:w-22 md:h-22 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-lg group-hover:border-cyan-500/60 transition-colors"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {req.groups?.map((g, i) => (
                <span
                  key={i}
                  className="bg-slate-800 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-700/60"
                >
                  {g}
                </span>
              ))}
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-snug">
              {req.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              @{req.user?.username}
            </span>
            <span>•</span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              ${req.amount.toLocaleString()} bet
            </span>
            {req.moderators && req.moderators.length > 0 && (
              <>
                <span>•</span>
                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  <span>Взято в работу: @{req.moderators.join(', @')}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: 3 Dates Block */}
      <PredictionDatesBlock
        created={req.created}
        betDate={req.bet_date}
        endDate={req.end_date}
      />
    </div>
  );
};

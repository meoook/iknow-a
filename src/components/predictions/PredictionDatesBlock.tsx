import React from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dates';

interface PredictionDatesBlockProps {
  created?: number | string | null;
  betDate?: string | null;
  endDate?: string | null;
  closedDate?: string | null;
  finalLabel?: string;
}

export const PredictionDatesBlock: React.FC<PredictionDatesBlockProps> = ({
  created,
  betDate,
  endDate,
  closedDate,
  finalLabel,
}) => {
  const createdStr = formatDisplayDate(created);
  const betDateStr = formatDisplayDate(betDate);
  const finalDateStr = formatDisplayDate(closedDate || endDate);
  const label = finalLabel || (closedDate ? 'Завершено:' : 'Финал:');

  return (
    <div className="w-full lg:w-auto shrink-0 bg-slate-950/70 px-4 py-3 rounded-xl border border-slate-800/80 flex flex-row lg:flex-col justify-between gap-3 text-xs min-w-[210px] self-stretch lg:self-center">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Создано:</span>
        </span>
        <span className="font-mono text-slate-300">{createdStr}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Ставки до:</span>
        </span>
        <span className="font-mono text-amber-400 font-semibold">{betDateStr}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{label}</span>
        </span>
        <span className="font-mono text-cyan-400 font-semibold">{finalDateStr}</span>
      </div>
    </div>
  );
};

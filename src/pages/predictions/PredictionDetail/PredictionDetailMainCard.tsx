import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Clock, CheckCircle2, FileText, ExternalLink, Tag, BarChart2 } from 'lucide-react';
import { IPredictionItem } from '../../../types';
import { formatDisplayDate } from '../../../utils/dates';
import { formatIconUrl } from '../../../utils/images';

interface PredictionDetailMainCardProps {
  prediction: IPredictionItem;
}

export const PredictionDetailMainCard: React.FC<PredictionDetailMainCardProps> = ({ prediction }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-6">
      {/* Icon, Title & Tags Header */}
      <div className="flex flex-col md:flex-row items-start gap-5">
        <div className="relative shrink-0">
          <img
            src={formatIconUrl(prediction.icon)}
            alt={prediction.title}
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-cyan-500/40 shadow-xl"
          />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {prediction.groups?.map((g, i) => (
              <span
                key={i}
                className="bg-slate-800 text-cyan-400 font-mono text-xs px-3 py-1 rounded-lg font-semibold border border-slate-700/60 flex items-center gap-1"
              >
                <Tag size={12} />
                {g}
              </span>
            ))}

            <span className="bg-slate-800/90 text-slate-300 font-mono text-xs font-bold px-3 py-1 rounded-lg border border-slate-700/60">
              Статус: {prediction.state}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
            {prediction.title}
          </h1>
        </div>
      </div>

      {/* Horizontal Row: Автор события, Общий объем, Даты */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
        {/* 1. Автор события */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <User size={14} className="text-cyan-400" />
            <span>Автор события</span>
          </span>
          <div>
            {prediction.user?.id ? (
              <Link
                to={`/users/${prediction.user.id}`}
                className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors font-bold font-mono text-base"
              >
                @{prediction.user.username}
              </Link>
            ) : (
              <div className="text-slate-100 font-bold font-mono text-base">
                @{prediction.user?.username ?? 'Пользователь'}
              </div>
            )}
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              ID: #{prediction.user?.id}
            </div>
          </div>
        </div>

        {/* 2. Общий объём ставок */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <BarChart2 size={14} className="text-emerald-400" />
            <span>Общий объём ставок</span>
          </span>
          <div>
            <div className="text-emerald-400 font-extrabold font-mono text-base">
              ${Number(prediction.volume || 0).toLocaleString()}
            </div>
            {prediction.amount > 0 && (
              <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                Начальная ставка: ${prediction.amount.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* 3. Даты */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-center gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock size={13} className="text-slate-500" />
              <span>Создано:</span>
            </span>
            <span className="font-mono text-slate-200 font-bold">
              {formatDisplayDate(prediction.created)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-amber-400" />
              <span>Ставки до:</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {formatDisplayDate(prediction.bet_date)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-cyan-400" />
              <span>{prediction.closed ? 'Завершено:' : 'Финал:'}</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {formatDisplayDate(prediction.closed || prediction.end_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Rules & Source Criteria */}
      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-xs flex flex-col gap-3">
        <div className="font-bold text-slate-200 flex items-center gap-2">
          <FileText size={16} className="text-cyan-400" />
          <span>Правила и критерии подведения итогов</span>
        </div>
        {prediction.rules && (
          <p className="text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
            {prediction.rules}
          </p>
        )}
        {prediction.link && (
          <div className="pt-1">
            <a
              href={prediction.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3.5 py-1.5 rounded-xl font-medium hover:bg-cyan-500/20 transition-colors cursor-pointer"
            >
              <span>Источник для проверки результатов: {prediction.link}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

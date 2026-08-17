import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Coins,
  RotateCcw,
  Clock,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { IPredictionItem } from '../../../types';

interface PredictionDetailStickyHeaderProps {
  prediction: IPredictionItem;
  hasWinner: boolean;
  isExtending: boolean;
  isFinishing: boolean;
  onOpenWinnerModal: () => void;
  onExtendDispute: () => void;
  onFinishPrediction: () => void;
}

export const PredictionDetailStickyHeader: React.FC<PredictionDetailStickyHeaderProps> = ({
  prediction,
  hasWinner,
  isExtending,
  isFinishing,
  onOpenWinnerModal,
  onExtendDispute,
  onFinishPrediction,
}) => {
  const isArchived = prediction.state === 'ENDED' || prediction.state === 'CANCEL';

  let backUrl = '/predictions/dispute';
  let backLabel = 'К выбору победителя';

  if (isArchived) {
    backUrl = '/predictions/archive';
    backLabel = 'Назад к архиву';
  } else if (hasWinner) {
    backUrl = '/predictions/finish';
    backLabel = 'К списку завершающих';
  }

  return (
    <div className="sticky top-16 z-20 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md -mx-8 -mt-8 mb-4 shadow-2xl transition-all">
      <div className="px-9 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Back Link & Moderator Badge */}
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </Link>

          {prediction.moderators && prediction.moderators.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
              <UserCheck size={14} className="text-amber-400" />
              <span>Взято в работу: @{prediction.moderators.join(', @')}</span>
            </div>
          )}
        </div>

        {/* Right Side: Action Buttons depending on State */}
        <div className="flex items-center gap-2.5">
          {isArchived ? (
            <div className="bg-slate-800/90 text-slate-300 font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700">
              Статус: {prediction.state}
            </div>
          ) : !hasWinner ? (
            /* Phase 1: Winner Selection Action */
            <button
              onClick={onOpenWinnerModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Award size={16} />
              <span>Выбрать победителя</span>
            </button>
          ) : (
            /* Phase 2: Finish & Settlement Actions */
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenWinnerModal}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Поменять победителя</span>
              </button>

              <button
                onClick={onExtendDispute}
                disabled={isExtending}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isExtending ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                <span>Продлить дискуссию</span>
              </button>

              <button
                onClick={onFinishPrediction}
                disabled={isFinishing}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                {isFinishing ? <Loader2 size={16} className="animate-spin" /> : <Coins size={16} />}
                <span>Завершить и выплатить выигрыши</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

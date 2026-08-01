import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearNewRequestsBadge } from '../../store/slices/predictionsSlice';

export const NewPredictionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const requests = useAppSelector((state) => state.predictions.requests);
  const hasUnread = useAppSelector((state) => state.predictions.hasUnreadNewRequests);

  // Clear red dot notification when user views this page
  useEffect(() => {
    if (hasUnread) {
      dispatch(clearNewRequestsBadge());
    }
  }, [hasUnread, dispatch]);

  const handleCardClick = (id: number) => {
    navigate(`/predictions/new/${id}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Subheader bar with queue count */}
      {requests.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Нажмите на карточку для перехода к детальной модерации</span>
          <span className="bg-cyan-500/20 text-cyan-400 font-mono px-2.5 py-1 rounded-full font-bold">
            {requests.length} в очереди
          </span>
        </div>
      )}

      {/* Requests List - Full Width Cards Container */}
      {requests.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Очередь модерации пуста</h3>
          <p className="text-sm text-slate-400">
            Все поступившие запросы были обработаны. Используйте симулятор WebSocket для проверки real-time событий!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => handleCardClick(req.id)}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 cursor-pointer glass-panel glass-panel-hover relative group flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all hover:border-cyan-500/40"
            >
              {/* Live WebSocket Event Red Dot Badge */}
              {req.hasUnreadWsEvent && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 rounded-full text-[10px] text-rose-300 font-bold z-10">
                  <span className="w-2 h-2 rounded-full bg-rose-500 red-dot-pulse" />
                  <span>Новый WS</span>
                </div>
              )}

              {/* Left & Middle Content: Larger Icon, Title, Tags, User, Bet */}
              <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                {/* Larger Icon */}
                <img
                  src={req.icon}
                  alt="Icon"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-lg group-hover:border-cyan-500/60 transition-colors"
                />

                <div className="min-w-0 flex-1 space-y-2">
                  {/* Tags & Title */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {req.groups.map((g, i) => (
                        <span key={i} className="bg-slate-800 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-700/60">
                          {g}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-snug">
                      {req.title}
                    </h3>
                  </div>

                  {/* User & Bet amount */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      @{req.user.username}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${req.amount.toLocaleString()} bet
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: 3 Dates Block */}
              <div className="w-full lg:w-auto shrink-0 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-row lg:flex-col justify-between gap-3 text-xs min-w-[210px] self-stretch lg:self-center">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Создано:</span>
                  </span>
                  <span className="font-mono text-slate-300">{req.created}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ставки до:</span>
                  </span>
                  <span className="font-mono text-amber-400 font-semibold">{req.betDate}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Финал:</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">{req.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

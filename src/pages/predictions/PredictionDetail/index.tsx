import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Calendar,
  BarChart2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Coins,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { useAppSelector } from '../../../store';
import { predictionsSelectors } from '../../../store/slices/predictionsSlice';
import { wsManager } from '../../../services/websocket';
import {
  useGetPredictionByIdQuery,
  useSetPredictionWinnerMutation,
  useFinishPredictionMutation,
  useExtendPredictionDisputeMutation,
} from '../../../services/adminApi';
import { formatIconUrl } from '../../../utils/images';

export const PredictionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const predictionId = Number(id);

  useEffect(() => {
    if (predictionId) wsManager.predictionJoin(predictionId);
    return () => {
      if (predictionId) wsManager.predictionLeave(predictionId);
    };
  }, [predictionId]);

  const prediction = useAppSelector((state) => predictionsSelectors.selectById(state, predictionId));

  const { isLoading } = useGetPredictionByIdQuery(predictionId, {
    skip: !predictionId || Boolean(prediction),
  });
  const [setWinnerApi, { isLoading: isSettingWinner }] = useSetPredictionWinnerMutation();
  const [finishApi, { isLoading: isFinishing }] = useFinishPredictionMutation();
  const [extendDisputeApi, { isLoading: isExtending }] = useExtendPredictionDisputeMutation();

  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [winnerSuccess, setWinnerSuccess] = useState(false);

  const handleExtendDispute = async () => {
    if (!prediction) return;
    try {
      await extendDisputeApi({ predictionId: prediction.id, days: 1 }).unwrap();
      navigate('/predictions/dispute');
    } catch (err) {
      console.warn('Extend dispute failed', err);
    }
  };

  const handleFinishPrediction = async () => {
    if (!prediction) return;
    try {
      await finishApi(prediction.id).unwrap();
      navigate('/predictions/finish');
    } catch (err) {
      console.warn('Finish prediction failed', err);
    }
  };

  if (isLoading && !prediction) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Загрузка информации о предсказании...</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <XCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Предсказание не найдено</h2>
        <Link
          to="/predictions/dispute"
          className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-cyan-500/20 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Вернуться к списку</span>
        </Link>
      </div>
    );
  }

  const currentWinner = prediction.choices?.find((c) => c.win === true);
  const hasWinner = Boolean(currentWinner);

  const handleOpenWinnerModal = () => {
    setSelectedChoiceId(currentWinner ? currentWinner.id : prediction.choices?.[0]?.id || null);
    setIsWinnerModalOpen(true);
  };

  const handleConfirmWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChoiceId) {
      try {
        await setWinnerApi({ predictionId: prediction.id, choiceId: selectedChoiceId }).unwrap();
        setWinnerSuccess(true);
        setTimeout(() => {
          setWinnerSuccess(false);
          setIsWinnerModalOpen(false);
        }, 1200);
      } catch (err) {
        console.warn('Set winner failed', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Navigation & Action Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl glass-panel">
        <Link
          to={hasWinner ? '/predictions/finish' : '/predictions/dispute'}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft size={16} />
          <span>{hasWinner ? 'Назад к списку завершающих' : 'Назад к выбору победителя'}</span>
        </Link>

        {/* Dynamic Admin Action Buttons depending on Phase */}
        {!hasWinner ? (
          /* Phase 1: Winner Selection Action */
          <button
            onClick={handleOpenWinnerModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Award size={16} />
            <span>Выбрать победителя</span>
          </button>
        ) : (
          /* Phase 2: Finish & Settlement Actions */
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenWinnerModal}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Поменять победителя</span>
            </button>

            <button
              onClick={handleExtendDispute}
              disabled={isExtending}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isExtending ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
              <span>Продлить дискуссию</span>
            </button>

            <button
              onClick={handleFinishPrediction}
              disabled={isFinishing}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isFinishing ? <Loader2 size={16} className="animate-spin" /> : <Coins size={16} />}
              <span>Завершить и выплатить выигрыши</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-6">
        {/* Header Block with Icon and Title */}
        <div className="flex flex-col sm:flex-row items-start gap-5 pb-6 border-b border-slate-800">
          <img
            src={formatIconUrl(prediction.icon)}
            alt={prediction.title}
            className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-xl shrink-0"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {prediction.groups?.map((group, idx) => (
                <span
                  key={idx}
                  className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
                >
                  {group}
                </span>
              ))}

              <span className="bg-slate-800 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded-full">
                Статус: {prediction.state}
              </span>

              {prediction.moderators && prediction.moderators.length > 0 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  Взято в работу: @{prediction.moderators.join(', @')}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              {prediction.title}
            </h1>

            {prediction.link && (
              <a
                href={prediction.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono"
              >
                <ExternalLink size={14} />
                <span>Ссылка для проверки исхода</span>
              </a>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BarChart2 size={18} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Общий объём ставок</div>
              <div className="text-sm font-bold text-white">${Number(prediction.volume || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Дата окончания</div>
              <div className="text-sm font-bold text-white">{prediction.endDate || '—'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Приём ставок до</div>
              <div className="text-sm font-bold text-white">{prediction.betDate || '—'}</div>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        {prediction.rules && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Правила проверки</h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {prediction.rules}
            </div>
          </div>
        )}
      </div>

      {/* Choices List Block */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-5">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Варианты исходов ({prediction.choices?.length || 0})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prediction.choices?.map((choice, idx) => (
            <div
              key={choice.id || idx}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${choice.win === true
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-950/70 border-slate-800'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {choice.icon && (
                  <img
                    src={formatIconUrl(choice.icon)}
                    alt={choice.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{choice.title}</span>
                    {choice.win === true && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 size={10} />
                        Победитель
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Коэффициент: <span className="text-cyan-400 font-bold">{choice.multiplier || 1.0}x</span> | Объём: ${Number(choice.volume || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winner Selection Modal */}
      {isWinnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="text-amber-400" size={20} />
                <span>Утверждение победителя</span>
              </h3>
              <button
                onClick={() => setIsWinnerModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            {winnerSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Победитель успешно утвержден!</h4>
              </div>
            ) : (
              <form onSubmit={handleConfirmWinner} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Выберите вариант исхода, который официально победил в данном событии:
                </p>

                <div className="space-y-2">
                  {prediction.choices?.map((choice) => (
                    <label
                      key={choice.id}
                      onClick={() => setSelectedChoiceId(choice.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedChoiceId === choice.id
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="winner_choice"
                          checked={selectedChoiceId === choice.id}
                          onChange={() => setSelectedChoiceId(choice.id)}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm font-bold">{choice.title}</span>
                      </div>

                      <span className="text-xs font-mono text-cyan-400">{choice.multiplier || 1.0}x</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsWinnerModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSettingWinner || !selectedChoiceId}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSettingWinner ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>Утвердить победителя</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

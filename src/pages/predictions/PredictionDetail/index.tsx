import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
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
import { useClickOutside } from '../../../hooks/useClickOutside';
import { PredictionDetailStickyHeader } from './PredictionDetailStickyHeader';
import { PredictionDetailMainCard } from './PredictionDetailMainCard';
import { PredictionDetailChoicesList } from './PredictionDetailChoicesList';

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

  const winnerModalRef = useRef<HTMLDivElement>(null);
  useClickOutside(winnerModalRef, () => setIsWinnerModalOpen(false), isWinnerModalOpen);

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
      <PredictionDetailStickyHeader
        prediction={prediction}
        hasWinner={hasWinner}
        isExtending={isExtending}
        isFinishing={isFinishing}
        onOpenWinnerModal={handleOpenWinnerModal}
        onExtendDispute={handleExtendDispute}
        onFinishPrediction={handleFinishPrediction}
      />

      <PredictionDetailMainCard prediction={prediction} />

      <PredictionDetailChoicesList prediction={prediction} />

      {/* Winner Selection Modal */}
      {isWinnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            ref={winnerModalRef}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="text-amber-400" size={20} />
                <span>Утверждение победителя</span>
              </h3>
              <button
                onClick={() => setIsWinnerModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedChoiceId === choice.id
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
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
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

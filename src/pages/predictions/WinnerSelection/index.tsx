import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { clearDisputeBadge } from '../../../store/slices/predictionsSlice';
import { useGetAdminPredictionsQuery } from '../../../services/adminApi';
import { PredictionCard } from '../../../components/predictions/PredictionCard';

export const WinnerSelectionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const hasUnreadDispute = useAppSelector((state) => state.predictions.hasUnreadDispute);
  const { data: predictionsList, isLoading } = useGetAdminPredictionsQuery({ phase: 'dispute' });

  useEffect(() => {
    if (hasUnreadDispute) {
      dispatch(clearDisputeBadge());
    }
  }, [hasUnreadDispute, dispatch]);

  const handleCardClick = (id: number) => {
    navigate(`/predictions/detail/${id}`);
  };

  const disputeItems = predictionsList || [];

  if (isLoading && disputeItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Загрузка предсказаний фазы дискуссии...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Predictions Grid / List */}
      {disputeItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Очередь выбора победителя пуста</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Все предсказания в фазе дискуссии были обработаны или отсутствуют. Новые события появятся здесь автоматически.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {disputeItems.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

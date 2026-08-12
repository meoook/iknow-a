import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { predictionsSelectors } from '../../../store/slices/predictionsSlice';
import { useGetPredictionsQuery } from '../../../services/adminApi';
import { PredictionCard } from '../../../components/predictions/PredictionCard';

export const FinishPredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const allPredictions = useAppSelector(predictionsSelectors.selectAll);
  const { isLoading } = useGetPredictionsQuery({ phase: 'finish' });

  const handleCardClick = (id: number) => {
    navigate(`/predictions/detail/${id}`);
  };

  const finishItems = allPredictions.filter(
    (p) => p.state === 'DISPUTE' && p.choices?.some((c) => c.win === true)
  );

  if (isLoading && finishItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <span>Загрузка завершающих предсказаний...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Predictions Grid / List */}
      {finishItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Нет предсказаний на завершение</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Все события с утвержденным победителем либо завершены, либо ещё не истекли по дате.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {finishItems.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} onClick={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};

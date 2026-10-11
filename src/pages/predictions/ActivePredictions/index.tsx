import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Activity } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { predictionsSelectors } from '../../../store/slices/predictionsSlice';
import { useGetPredictionsQuery } from '../../../services/adminApi';
import { PredictionCard } from '../../../components/predictions/PredictionCard';

export const ActivePredictionsPage: React.FC = () => {
  const navigate = useNavigate();

  const allPredictions = useAppSelector(predictionsSelectors.selectAll);
  const { isLoading } = useGetPredictionsQuery({ phase: 'active' });

  const handleCardClick = (id: number) => {
    navigate(`/predictions/detail/${id}`);
  };

  const activeItems = allPredictions.filter((p) => p.state === 'ACTIVE');

  if (isLoading && activeItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Загрузка активных предсказаний...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {activeItems.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <Activity className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Нет активных предсказаний</h3>
          <p className="text-sm text-slate-400 max-w-md">
            В данный момент нет предсказаний со статусом приема ставок.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeItems.map((prediction) => (
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

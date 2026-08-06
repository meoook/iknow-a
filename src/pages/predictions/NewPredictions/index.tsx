import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { clearNewRequestsBadge } from '../../../store/slices/predictionsSlice';
import { useGetPredictionRequestsQuery } from '../../../services/adminApi';
import { NewPredictionsHeader } from './NewPredictionsHeader';
import { NewPredictionCard } from './NewPredictionCard';

export const NewPredictionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const requests = useAppSelector((state) => state.predictions.requests);
  const hasUnread = useAppSelector((state) => state.predictions.hasUnreadNewRequests);

  const { isLoading } = useGetPredictionRequestsQuery();

  useEffect(() => {
    if (hasUnread) {
      dispatch(clearNewRequestsBadge());
    }
  }, [hasUnread, dispatch]);

  const handleCardClick = (id: number) => {
    navigate(`/predictions/new/${id}`);
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Загрузка новых предсказаний с сервера...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <NewPredictionsHeader queueCount={requests.length} />

      {requests.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Очередь модерации пуста</h3>
          <p className="text-sm text-slate-400">
            Все поступившие запросы были успешно обработаны. Новые заявки от пользователей появятся здесь в режиме реального времени.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <NewPredictionCard key={req.id} req={req} onClick={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};

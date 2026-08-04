import React from 'react';

interface NewPredictionsHeaderProps {
  queueCount: number;
}

export const NewPredictionsHeader: React.FC<NewPredictionsHeaderProps> = ({ queueCount }) => {
  if (queueCount === 0) return null;

  return (
    <div className="flex items-center justify-between text-xs text-slate-400">
      <span>Нажмите на карточку для перехода к детальной модерации</span>
      <span className="bg-cyan-500/20 text-cyan-400 font-mono px-2.5 py-1 rounded-full font-bold">
        {queueCount} в очереди
      </span>
    </div>
  );
};

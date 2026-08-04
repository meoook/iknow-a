import React from 'react';
import { NavLink } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAppSelector } from '../../store';

export const DashboardActivePredictionsPreview: React.FC = () => {
  const activePredictions = useAppSelector((state) => state.predictions.active);

  return (
    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 glass-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Топ активных предсказаний</span>
        </h2>
        <NavLink to="/predictions/active" className="text-xs text-cyan-400 hover:underline font-medium">
          Посмотреть все ({activePredictions.length})
        </NavLink>
      </div>

      <div className="space-y-3">
        {activePredictions.slice(0, 3).map((pred) => (
          <div
            key={pred.id}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={pred.icon}
                alt="Icon"
                className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-200 truncate">{pred.title}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>Группы: {pred.groups.join(', ')}</span>
                  <span>•</span>
                  <span>Исходов: {pred.choices.length}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-bold font-mono text-cyan-400">
                ${pred.volume.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Объем ставок</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

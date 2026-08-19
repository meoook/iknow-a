import React from 'react';
import { Calendar } from 'lucide-react';
import { LineAreaChart } from '../../components/ui/LineAreaChart';

interface EarningsHistoryItem {
  date: string;
  amount: number;
}

interface EarningsLineChartProps {
  history: EarningsHistoryItem[];
  showDots?: boolean;
}

export const EarningsLineChart: React.FC<EarningsLineChartProps> = ({ history, showDots = true }) => {
  const chartData = React.useMemo(() => {
    return history.map((item) => ({
      time: item.date,
      value: item.amount,
    }));
  }, [history]);

  return (
    <div className="pt-4 font-sans">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={13} className="text-cyan-400" />
          <span>Динамика комиссии</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Наведите на точку графика для деталей
        </span>
      </div>

      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
        <LineAreaChart
          data={chartData}
          height={160}
          colorScheme="cyan"
          showDots={showDots}
          valuePrefix="$"
        />
      </div>
    </div>
  );
};

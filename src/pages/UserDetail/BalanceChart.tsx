import React from 'react';
import { LineAreaChart, LineAreaChartPoint } from '../../components/ui/LineAreaChart';

interface BalanceChartProps {
  data: LineAreaChartPoint[];
  period?: string;
  showDots?: boolean;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ data, period, showDots = false }) => {
  return (
    <LineAreaChart
      data={data}
      height={220}
      colorScheme="emerald"
      period={period}
      showDots={showDots}
      valuePrefix="$"
    />
  );
};



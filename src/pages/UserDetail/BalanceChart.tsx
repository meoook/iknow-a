import React from 'react';
import { LineAreaChart } from '../../components/ui/LineAreaChart';
import { IHistoryPoint } from '../../types';

interface BalanceChartProps {
  data: IHistoryPoint[];
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



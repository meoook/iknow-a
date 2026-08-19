import React from 'react';
import { LineAreaChart, LineAreaChartPoint } from '../../components/ui/LineAreaChart';

interface BalanceChartProps {
  data: LineAreaChartPoint[];
  showDots?: boolean;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ data, showDots = false }) => {
  return (
    <LineAreaChart
      data={data}
      height={220}
      colorScheme="emerald"
      showDots={showDots}
      valuePrefix="$"
    />
  );
};


import type { FC } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import { useBumbaChartData } from '@/hooks/bumba.hooks';
import { formatPercentTick } from '@/utils/format.util';

const BumbaRatioChart: FC = () => {
  const { ratioChartData } = useBumbaChartData();

  return (
    <ChartCard title="Netto / bruto ratio" height={200}>
      <AreaChart data={ratioChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-muted)" interval="preserveStartEnd" />
        <YAxis
          tickFormatter={formatPercentTick}
          tick={{ fontSize: 11 }}
          stroke="var(--color-muted)"
          domain={['auto', 'auto']}
        />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? [`${value.toFixed(1)}%`, 'Ratio'] : String(value))}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
        <Area
          type="monotone"
          dataKey="ratio"
          stroke="var(--color-pension)"
          fill="var(--color-pension)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartCard>
  );
};

export { BumbaRatioChart };

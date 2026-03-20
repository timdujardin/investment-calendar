import type { FC } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import { useWageChartData } from '@/hooks/wage.hooks';

const WageRaiseChart: FC = () => {
  const { raiseChartData } = useWageChartData();

  return (
    <ChartCard title="Opslag & indexaties" height={200}>
      <BarChart data={raiseChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
        <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? [`${value.toFixed(2)}%`, 'Opslag'] : String(value))}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
        <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
          {raiseChartData.map((entry, i) => (
            <Cell key={i} fill={entry.percentage >= 0 ? 'var(--color-success)' : 'var(--color-warning)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
};

export { WageRaiseChart };

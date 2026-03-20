import type { FC } from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import { useBumbaChartData } from '@/hooks/bumba.hooks';
import { formatCurrency, formatCurrencyCompact } from '@/utils/format.util';

const BumbaPremiumChart: FC = () => {
  const { premiumChartData } = useBumbaChartData();

  return (
    <ChartCard title="Eindejaarspremies" height={200}>
      <BarChart data={premiumChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
        <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? [formatCurrency(value), 'Premie'] : String(value))}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
        <Bar dataKey="premium" fill="var(--color-orange)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
};

export { BumbaPremiumChart };

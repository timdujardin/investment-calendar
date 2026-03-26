import type { FC } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import { useBumbaChartData } from '@/hooks/bumba.hooks';
import { formatCurrency } from '@/utils/format.util';

const PATTERN_SIZE = 6;

const getFill = (isIndexation: boolean, isNegative: boolean): string => {
  if (isNegative) 
{return 'var(--color-warning)';}

  return isIndexation ? 'url(#pattern-indexatie)' : 'var(--color-success)';
};

const ChartPatterns: FC = () => (
  <defs>
    <pattern
      id="pattern-indexatie"
      patternUnits="userSpaceOnUse"
      width={PATTERN_SIZE}
      height={PATTERN_SIZE}
      patternTransform="rotate(45)"
    >
      <rect width={PATTERN_SIZE} height={PATTERN_SIZE} fill="var(--color-success)" fillOpacity={0.25} />
      <line x1={0} y1={0} x2={0} y2={PATTERN_SIZE} stroke="var(--color-success)" strokeWidth={2} />
    </pattern>
  </defs>
);

const legend = (
  <div className="chart-company-legend">
    <span className="chart-company-legend__item">
      <span className="chart-company-legend__swatch" style={{ background: 'var(--color-success)' }} />
      Opslag
    </span>
    <span className="chart-company-legend__item">
      <span
        className="chart-company-legend__swatch"
        style={{
          background: 'repeating-linear-gradient(45deg, var(--color-success) 0 2px, transparent 2px 4px)',
        }}
      />
      Indexatie
    </span>
  </div>
);

const BumbaRaiseChart: FC = () => {
  const { raiseChartData } = useBumbaChartData();

  return (
    <ChartCard title="Opslag & indexaties" footer={legend} height={200}>
      <BarChart data={raiseChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <ChartPatterns />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-muted)" interval="preserveStartEnd" />
        <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
        <Tooltip
          formatter={(value, _name, props) => {
            if (typeof value !== 'number') 
{return String(value);}
            const { isIndexation, euroGross, euroNet } = props.payload ?? {};
            const label = isIndexation ? 'Indexatie' : 'Opslag';
            const parts = [`${value.toFixed(2)}%`];
            if (euroGross != null) 
{parts.push(`bruto ${formatCurrency(euroGross)}`);}
            if (euroNet != null) 
{parts.push(`netto ${formatCurrency(euroNet)}`);}

            return [parts.join(' · '), label];
          }}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
        <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
          {raiseChartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.percentage != null ? getFill(entry.isIndexation, entry.percentage < 0) : 'transparent'}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
};

export { BumbaRaiseChart };

import type { FC } from 'react';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import { useChartData } from '@/hooks/investment.hooks';
import { formatCurrencyCompact, formatTooltipCurrencyCompact } from '@/utils/format.util';

interface ChartDataRow {
  year: string;
  investments: number;
  pension: number;
  total: number;
  bolero: number;
  crelanPlans: number;
  pensionTotal: number;
  cashReserve: number;
  boleroCash: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDataRow }[];
  label?: string;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '10px',
        }}
      >
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Jaar: {label}</p>
        <p>Bolero: {formatTooltipCurrencyCompact(data.bolero)}</p>
        <p>Crelan: {formatTooltipCurrencyCompact(data.crelanPlans)}</p>
        <p>Pensioensparen: {formatTooltipCurrencyCompact(data.pensionTotal)}</p>
        <p>Spaarrekening: {formatTooltipCurrencyCompact(data.cashReserve)}</p>
        <p>Bolero-cash: {formatTooltipCurrencyCompact(data.boleroCash)}</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Totaal: {formatTooltipCurrencyCompact(data.total)}</p>
      </div>
    );
  }

  return null;
};

const PrognoseLineChart: FC = () => {
  const chartData = useChartData();

  return (
    <ChartCard
      title="Prognose — Bolero/Crelan & Pensioensparen"
      disclaimer="Bedragen zijn na aftrek van kosten en belasting."
    >
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
        <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="investments"
          name="Bolero + Crelan"
          stroke="var(--color-investment)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="pension"
          name="Pensioensparen"
          stroke="var(--color-pension)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Totaal"
          stroke="var(--color-total)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ChartCard>
  );
};

export { PrognoseLineChart };

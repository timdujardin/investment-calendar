import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useChartData } from '../../hooks/investment.hooks';
import { formatCurrencyCompact } from '../../utils/format.util';

export function PrognoseLineChart() {
  const chartData = useChartData();

  return (
    <div className="chart-wrap">
      <div className="chart-title">Prognose — Investering & Pensioensparen</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            stroke="var(--color-muted)"
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyCompact(v)}
            tick={{ fontSize: 11 }}
            stroke="var(--color-muted)"
          />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number' ? formatCurrencyCompact(value) : String(value)
            }
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--color-border)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="investments"
            name="Investments"
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
      </ResponsiveContainer>
      <p className="chart-disclaimer">
        Grafiek toont bruto bedragen vóór kosten en belasting. Zie de kaarten hierboven voor netto bedragen.
      </p>
    </div>
  );
}

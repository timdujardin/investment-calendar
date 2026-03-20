import type { FC } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import { useBumbaChartData } from '@/hooks/bumba.hooks';
import { formatCurrency, formatCurrencyCompact } from '@/utils/format.util';

import { LEGEND_MAP, ZONE_FILLS } from './bumba-line-chart.constants';

const BumbaLineChart: FC = () => {
  const { lineChartData, companyZones } = useBumbaChartData();

  const companyLegend = (
    <div className="chart-company-legend">
      {companyZones.map((zone) => (
        <span key={zone.company} className="chart-company-legend__item">
          <span
            className="chart-company-legend__swatch"
            style={{ background: ZONE_FILLS[zone.index % ZONE_FILLS.length] }}
          />
          {zone.company}
        </span>
      ))}
    </div>
  );

  return (
    <ChartCard title="Bruto & netto loon — evolutie" footer={companyLegend}>
      <LineChart data={lineChartData} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />

        {companyZones.map((zone) => (
          <ReferenceArea
            key={zone.company}
            x1={zone.startDate}
            x2={zone.endDate}
            fill={ZONE_FILLS[zone.index % ZONE_FILLS.length]}
            fillOpacity={0.07}
            ifOverflow="extendDomain"
          />
        ))}

        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-muted)" interval="preserveStartEnd" />
        <YAxis
          tickFormatter={formatCurrencyCompact}
          tick={{ fontSize: 11 }}
          stroke="var(--color-muted)"
          domain={['auto', 'auto']}
        />
        <Tooltip
          formatter={(value, name) =>
            typeof value === 'number' ? [formatCurrency(value), LEGEND_MAP[name as string] ?? name] : String(value)
          }
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
        <Legend formatter={(value: string) => LEGEND_MAP[value] ?? value} />

        <Line
          type="monotone"
          dataKey="gross"
          stroke="var(--color-investment)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="var(--color-success)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="grossWithoutA11y"
          stroke="var(--color-investment)"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          activeDot={{ r: 3 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="netWithoutA11y"
          stroke="var(--color-success)"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          activeDot={{ r: 3 }}
          connectNulls={false}
        />
      </LineChart>
    </ChartCard>
  );
};

export { BumbaLineChart };

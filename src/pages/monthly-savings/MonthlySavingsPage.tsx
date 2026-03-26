import { useState, type FC } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';

import { BIRTH_YEAR } from '@config/investment.config';
import ChartCard from '@/components/atoms/chart-card/ChartCard';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useSettings } from '@/contexts/SettingsContext';
import { useSavingsTracker } from '@/hooks/savingsTracker.hooks';
import { formatCurrency, formatCurrencyCompact, formatDifference, formatTooltipCurrency } from '@/utils/format.util';

import { DashboardStatus } from './_components/dashboard-status/DashboardStatus';
import { targetSummaryValue, trackerCell, trackerCellStatus } from './MonthlySavingsPage.styles';

const getTrackerStatus = (saved: number | null, target: number): 'ok' | 'warn' | null => {
  if (saved === null) 
{return null;}

  return saved >= target ? 'ok' : 'warn';
};

const MonthlySavingsPage: FC = () => {
  const { settings } = useSettings();
  const { startYear, endYear } = settings;
  const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear >= startYear && currentYear <= endYear ? currentYear : startYear;
  const [year, setYear] = useState(defaultYear);
  const { months, totalSaved, totalTarget, filledMonths, target, setSaved, lastFilledMonth, chartData } =
    useSavingsTracker(year);

  const difference = lastFilledMonth ? lastFilledMonth.difference : 0;

  return (
    <div className="page">
      <div className="year-selector">
        <label className="year-selector__label" htmlFor="tracker-year">
          Jaar
        </label>
        <select
          id="tracker-year"
          className="year-selector__select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y} — {y - BIRTH_YEAR} jaar
            </option>
          ))}
        </select>
        <span className="year-selector__hint">Berekeningen op basis van positie einde geselecteerd jaar</span>
      </div>

      <DashboardStatus />

      <ChartCard title={`Cumulatief gespaard vs. doel — ${year}`} height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
          <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
          <Tooltip
            formatter={formatTooltipCurrency}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
          />
          <Legend />
          <ReferenceLine y={totalTarget} stroke="var(--color-muted)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="doel"
            name="Doel"
            stroke="var(--color-muted)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="gespaard"
            name="Gespaard"
            stroke="var(--color-investment)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--color-investment)' }}
            connectNulls={false}
          />
        </LineChart>
      </ChartCard>

      <PageHeader
        title={`📅 Maandelijks sparen ${year}`}
        subtitle={`Doel: ${formatCurrency(target)}/mnd investering`}
      />

      <main className="page__main">
        <div className="tracker-grid">
          {months.map((m) => (
            <div key={m.monthIndex} className={trackerCell({ status: getTrackerStatus(m.saved, m.target) })}>
              <span className="tracker-cell__month">{m.label}</span>
              <input
                className="tracker-cell__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder={`${target}`}
                value={m.saved !== null ? m.saved : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSaved(m.monthIndex, val === '' ? null : parseFloat(val) || 0);
                }}
                aria-label={`Investering ${m.label} ${year}`}
              />
              {m.saved !== null && (
                <span
                  className={trackerCellStatus({
                    status: m.saved >= m.target ? 'ok' : 'warn',
                  })}
                >
                  {m.saved >= m.target ? '✓' : formatDifference(m.saved - m.target)}
                </span>
              )}
            </div>
          ))}
        </div>

        {filledMonths > 0 && (
          <div className="target-summary">
            <div className="target-summary__title">Overzicht {year}</div>
            <div className="target-summary__rows">
              <div className="target-summary__row">
                <span className="target-summary__label">Gespaard ({filledMonths} mnd)</span>
                <span className="target-summary__value">{formatCurrency(totalSaved)}</span>
              </div>
              <div className="target-summary__row">
                <span className="target-summary__label">Doel ({filledMonths} mnd)</span>
                <span className="target-summary__value">{formatCurrency(target * filledMonths)}</span>
              </div>
              <div className="target-summary__row target-summary__row--total">
                <span className="target-summary__label">Verschil</span>
                <span
                  className={targetSummaryValue({
                    polarity: difference >= 0 ? 'positive' : 'negative',
                  })}
                >
                  {difference >= 0 ? '+' : ''}
                  {formatCurrency(difference)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export { MonthlySavingsPage };

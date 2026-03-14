import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '../utils/format.util';
import { useSavingsTracker } from '../hooks/savingsTracker.hooks';
import { useSettings } from '../contexts/SettingsContext';

export function MonthlySavingsPage() {
  const { settings } = useSettings();
  const { startYear, endYear } = settings;
  const yearOptions = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear >= startYear && currentYear <= endYear ? currentYear : startYear;
  const [year, setYear] = useState(defaultYear);
  const { months, totalSaved, totalTarget, filledMonths, target, setSaved } = useSavingsTracker(year);

  const chartData = months.map((m) => ({
    month: m.label,
    doel: m.cumulativeTarget,
    gespaard: m.saved !== null ? m.cumulativeSaved : null,
  }));

  const lastFilledMonth = months.filter((m) => m.saved !== null).at(-1);
  const isOnTrack = lastFilledMonth ? lastFilledMonth.isOnTrack : true;
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
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <header className="page-header">
        <h1 className="page-header__title">📅 Maandelijks sparen {year}</h1>
        <p className="page-header__subtitle">
          Doel: {formatCurrency(target)}/mnd investering
        </p>
      </header>

      <main className="page__main">
        <div className="tracker-grid">
          {months.map((m) => (
            <div
              key={m.monthIndex}
              className={`tracker-cell ${
                m.saved !== null
                  ? m.saved >= m.target
                    ? 'tracker-cell--ok'
                    : 'tracker-cell--warn'
                  : ''
              }`}
            >
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
                  className={`tracker-cell__status ${
                    m.saved >= m.target
                      ? 'tracker-cell__status--ok'
                      : 'tracker-cell__status--warn'
                  }`}
                >
                  {m.saved >= m.target ? '✓' : `${m.saved - m.target >= 0 ? '+' : ''}${m.saved - m.target}`}
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
                  className={`target-summary__value target-summary__value--bold ${
                    difference >= 0 ? 'target-summary__value--positive' : 'target-summary__value--negative'
                  }`}
                >
                  {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                </span>
              </div>
            </div>
          </div>
        )}

        {filledMonths > 0 && (
          <div
            className={`savings-status ${
              isOnTrack ? 'savings-status--on-track' : 'savings-status--off-track'
            }`}
          >
            <span className="savings-status__icon">{isOnTrack ? '✓' : '⚠'}</span>
            <span className="savings-status__text">
              {isOnTrack
                ? `Op koers — je zit ${formatCurrency(Math.abs(difference))} voor op je doel`
                : `Niet op koers — ${formatCurrency(Math.abs(difference))} achterstand`}
            </span>
          </div>
        )}

        <div className="chart-wrap">
          <div className="chart-title">Cumulatief gespaard vs. doel — {year}</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <YAxis
                tickFormatter={(v) => formatCurrencyCompact(v)}
                tick={{ fontSize: 11 }}
                stroke="var(--color-muted)"
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number' ? formatCurrency(value) : '—'
                }
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                }}
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
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

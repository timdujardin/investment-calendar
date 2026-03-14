import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useInvestment } from '../contexts/InvestmentContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, formatCurrencyCompact } from '../utils/format.util';
import { getAgeFromYear } from '../utils/investmentCalculation.util';
import { YearSelector, useCurrentYearIndex } from '../components/atoms/YearSelector';
import {
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  CRELAN_START_VALUE,
} from '../../config/investment.config';

export function PensionPage() {
  const { pensionData, combinedData } = useInvestment();
  const { investmentYears, settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const row = pensionData[yearIndex];
  const combined = combinedData[yearIndex];
  const year = investmentYears[yearIndex];
  const age = getAgeFromYear(year);
  const baloiseMonthly = yearIndex === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027;
  const recapturePercent = (settings.pensionRecaptureRate * 100).toFixed(0);

  const totalInterest = row.valueTotal - row.investedTotal;
  const returnPercent =
    row.investedTotal > 0
      ? ((totalInterest / row.investedTotal) * 100).toFixed(1)
      : '0.0';

  const chartData = useMemo(
    () =>
      pensionData.map((r, i) => ({
        year: String(investmentYears[i]),
        ingelegd: r.investedTotal,
        winst: Math.max(r.valueTotal - r.investedTotal, 0),
      })),
    [pensionData, investmentYears],
  );

  return (
    <div className="page">
      <YearSelector value={yearIndex} onChange={setYearIndex} />

      <header className="page-header">
        <h1 className="page-header__title">🏦 Pensioensparen — {year}</h1>
        <p className="page-header__subtitle">
          {age} jaar · Crelan {(settings.crelanRate * 100).toFixed(1)}%/jaar + Baloise {(settings.baloiseRate * 100).toFixed(1)}%/jaar
        </p>
      </header>

      <main className="page__main">
        <div className="chart-wrap">
          <div className="chart-title">Inleg vs. winst — {settings.startYear}–{settings.endYear}</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <Tooltip
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)}
                contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingelegd"
                name="Ingelegd"
                stackId="1"
                stroke="var(--color-muted)"
                fill="var(--color-muted)"
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="winst"
                name="Winst"
                stackId="1"
                stroke="var(--color-pension)"
                fill="var(--color-pension)"
                fillOpacity={0.45}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-grid">
          <div className="detail-card detail-card--highlight">
            <span className="detail-card__label">Totaal waarde (bruto)</span>
            <span className="detail-card__value detail-card__value--large text-pension">
              {formatCurrency(row.valueTotal)}
            </span>
            <span className="detail-card__sub">
              Ingelegd: {formatCurrency(row.investedTotal)} · Winst: +{formatCurrency(totalInterest)} (+{returnPercent}%)
            </span>
          </div>
          <div className="detail-card detail-card--highlight">
            <span className="detail-card__label">Netto waarde</span>
            <span className="detail-card__value detail-card__value--large text-pension">
              {formatCurrency(combined.pensionNetValue)}
            </span>
            <span className="detail-card__sub">
              Bij pensionering: -{recapturePercent}% terugvordering (-{formatCurrency(combined.pensionRecapture)})
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Crelan ({(settings.crelanRate * 100).toFixed(1)}%/jaar)</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Ingelegd</span>
              <span className="detail-card__value frozen">
                {formatCurrency(row.investedCrelan)}
              </span>
              <span className="detail-card__sub">Eenmalige storting — blijft staan</span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Waarde</span>
              <span className="detail-card__value text-pension">
                {formatCurrency(row.valueCrelan)}
              </span>
              <span className="detail-card__sub">
                +{formatCurrency(row.valueCrelan - CRELAN_START_VALUE)} rente
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Baloise ({(settings.baloiseRate * 100).toFixed(1)}%/jaar)</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Ingelegd</span>
              <span className="detail-card__value">
                {formatCurrency(row.investedBaloise)}
              </span>
              <span className="detail-card__sub">
                €{baloiseMonthly}/mnd
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Waarde</span>
              <span className="detail-card__value text-pension">
                {formatCurrency(row.valueBaloise)}
              </span>
              <span className="detail-card__sub">
                +{formatCurrency(row.valueBaloise - row.investedBaloise)} rente
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

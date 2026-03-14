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
import { YearSelector, useCurrentYearIndex } from '../components/atoms/YearSelector';

export function InvestmentsPage() {
  const { combinedData } = useInvestment();
  const { settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const row = combinedData[yearIndex];
  const prevRow = yearIndex > 0 ? combinedData[yearIndex - 1] : null;

  const yearGrowth = prevRow
    ? row.investmentValue - prevRow.investmentValue
    : row.investmentValue;

  const returnOnInvestment =
    row.investmentInvested > 0
      ? ((row.investmentInterest / row.investmentInvested) * 100).toFixed(1)
      : '0.0';

  const isTargetReached = row.totalValue >= settings.targetAmount;
  const wasTargetReachedBefore = prevRow && prevRow.totalValue >= settings.targetAmount;

  const chartData = useMemo(
    () =>
      combinedData.map((r) => ({
        year: String(r.year),
        ingelegd: r.investmentInvested,
        winst: Math.max(r.investmentInterest, 0),
      })),
    [combinedData],
  );

  return (
    <div className="page">
      <YearSelector value={yearIndex} onChange={setYearIndex} />

      <header className="page-header">
        <h1 className="page-header__title">📈 Investeringen — {row.year}</h1>
        <p className="page-header__subtitle">
          {row.age} jaar · {settings.rate}% rendement · €{row.investmentMonthly}/mnd
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
                stroke="var(--color-interest)"
                fill="var(--color-interest)"
                fillOpacity={0.45}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-grid">
          <div className="detail-card detail-card--highlight">
            <span className="detail-card__label">Portefeuille waarde (bruto)</span>
            <span className="detail-card__value detail-card__value--large text-investment">
              {formatCurrency(row.investmentValue)}
            </span>
            <span className="detail-card__sub">
              Ingelegd: {formatCurrency(row.investmentInvested)} · Winst: +{formatCurrency(row.investmentInterest)} (+{returnOnInvestment}%)
            </span>
            {isTargetReached && !wasTargetReachedBefore && (
              <span className="detail-card__badge detail-card__badge--success">
                Doelbedrag {formatCurrency(settings.targetAmount)} bereikt
              </span>
            )}
          </div>
          <div className="detail-card detail-card--highlight">
            <span className="detail-card__label">Netto waarde</span>
            <span className="detail-card__value detail-card__value--large text-investment">
              {formatCurrency(row.investmentNetValue)}
            </span>
            <span className="detail-card__sub">
              Na {(settings.transactionFeeRate * 100).toFixed(0)}% kosten en {(settings.capitalGainsTaxRate * 100).toFixed(0)}% meerwaardetaks
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Inleg & rendement</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Totaal ingelegd</span>
              <span className="detail-card__value">
                {formatCurrency(row.investmentInvested)}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Rente-winst</span>
              <span className="detail-card__value text-interest">
                +{formatCurrency(row.investmentInterest)}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Kosten & belasting</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Beurstaks + makelaarskosten</span>
              <span className="detail-card__value text-warn">
                -{formatCurrency(row.investmentTransactionCosts)}
              </span>
              <span className="detail-card__sub">
                {(settings.transactionFeeRate * 100).toFixed(0)}% op {formatCurrency(row.investmentInvested)} inleg
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Meerwaardetaks</span>
              <span className="detail-card__value text-warn">
                -{formatCurrency(row.investmentCapitalGainsTax)}
              </span>
              <span className="detail-card__sub">
                {(settings.capitalGainsTaxRate * 100).toFixed(0)}% per €10.000 winst
              </span>
            </div>
          </div>
          <p className="detail-section__disclaimer">
            Meerwaardetaks wordt berekend op elke volledige schijf van €10.000 winst.
            Huidige winst: {formatCurrency(Math.max(row.investmentInterest, 0))} — belastbare schijven: {Math.floor(Math.max(row.investmentInterest, 0) / 10_000)}.
          </p>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Groei</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Groei dit jaar</span>
              <span className="detail-card__value text-interest">
                +{formatCurrency(yearGrowth)}
              </span>
              {prevRow && (
                <span className="detail-card__sub">
                  Vorig jaar: {formatCurrency(prevRow.investmentValue)}
                </span>
              )}
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Rendement op inleg</span>
              <span className="detail-card__value text-interest">
                +{returnOnInvestment}%
              </span>
              <span className="detail-card__sub">
                €{row.investmentMonthly}/mnd storting
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

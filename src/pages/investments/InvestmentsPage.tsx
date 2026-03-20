import { useState, type FC } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useCurrentYearIndex, YearSelector } from '@/components/atoms/year-selector/YearSelector';
import { useSettings } from '@/contexts/SettingsContext';
import { useInvestmentChartData, useInvestmentPageData } from '@/hooks/investment.hooks';
import { formatCurrency, formatCurrencyCompact } from '@/utils/format.util';

const InvestmentsPage: FC = () => {
  const { settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const { row, prevRow, yearGrowth, returnOnInvestment, isTargetReached, wasTargetReachedBefore } =
    useInvestmentPageData(yearIndex);
  const chartData = useInvestmentChartData();

  return (
    <div className="page">
      <YearSelector value={yearIndex} onChange={setYearIndex} />

      <PageHeader
        title={`📈 Investeringen — ${row.year}`}
        subtitle={`${row.age} jaar · ${settings.rate}% rendement · €${row.investmentMonthly}/mnd`}
      />

      <main className="page__main">
        <ChartCard title={`Inleg vs. winst — ${settings.startYear}–${settings.endYear}`} height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
            <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : String(value))}
              contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="netto"
              name="Netto waarde"
              stackId="1"
              stroke="var(--color-investment)"
              fill="var(--color-investment)"
              fillOpacity={0.35}
            />
            <Area
              type="monotone"
              dataKey="kosten"
              name="Kosten & belasting"
              stackId="1"
              stroke="var(--color-muted)"
              fill="var(--color-muted)"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ChartCard>

        <div className="detail-grid">
          <DetailCard
            label="Portefeuille waarde"
            value={formatCurrency(row.investmentNetValue)}
            sub={
              <>
                Bruto: {formatCurrency(row.investmentValue)} · Na {(settings.transactionFeeRate * 100).toFixed(0)}%
                kosten en {(settings.capitalGainsTaxRate * 100).toFixed(0)}% meerwaardetaks
              </>
            }
            highlight
            valueClassName="detail-card__value--large text-investment"
            badge={
              isTargetReached && !wasTargetReachedBefore ? (
                <span className="detail-card__badge detail-card__badge--success">
                  Doelbedrag {formatCurrency(settings.targetAmount)} bereikt
                </span>
              ) : undefined
            }
          />
          <DetailCard
            label="Winst op inleg"
            value={`+${formatCurrency(row.investmentInterest)} (+${returnOnInvestment}%)`}
            sub={`Ingelegd: ${formatCurrency(row.investmentInvested)}`}
            highlight
            valueClassName="detail-card__value--large text-interest"
          />
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Inleg & rendement</h2>
          <div className="detail-grid">
            <DetailCard label="Totaal ingelegd" value={formatCurrency(row.investmentInvested)} />
            <DetailCard
              label="Rente-winst"
              value={`+${formatCurrency(row.investmentInterest)}`}
              valueClassName="text-interest"
            />
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Kosten & belasting</h2>
          <div className="detail-grid">
            <DetailCard
              label="Beurstaks + makelaarskosten"
              value={`-${formatCurrency(row.investmentTransactionCosts)}`}
              sub={`${(settings.transactionFeeRate * 100).toFixed(0)}% op ${formatCurrency(row.investmentInvested)} inleg`}
              valueClassName="text-warn"
            />
            <DetailCard
              label="Meerwaardetaks"
              value={`-${formatCurrency(row.investmentCapitalGainsTax)}`}
              sub={`${(settings.capitalGainsTaxRate * 100).toFixed(0)}% per €10.000 winst`}
              valueClassName="text-warn"
            />
          </div>
          <p className="detail-section__disclaimer">
            Meerwaardetaks wordt berekend op elke volledige schijf van €10.000 winst. Huidige winst:{' '}
            {formatCurrency(Math.max(row.investmentInterest, 0))} — belastbare schijven:{' '}
            {Math.floor(Math.max(row.investmentInterest, 0) / 10_000)}.
          </p>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Groei</h2>
          <div className="detail-grid">
            <DetailCard
              label="Groei dit jaar"
              value={`+${formatCurrency(yearGrowth)}`}
              sub={prevRow ? `Vorig jaar: ${formatCurrency(prevRow.investmentValue)}` : undefined}
              valueClassName="text-interest"
            />
            <DetailCard
              label="Rendement op inleg"
              value={`+${returnOnInvestment}%`}
              sub={`€${row.investmentMonthly}/mnd storting`}
              valueClassName="text-interest"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export { InvestmentsPage };

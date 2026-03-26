import { useState, type FC } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

import ChartCard from '@/components/atoms/chart-card/ChartCard';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useCurrentYearIndex, YearSelector } from '@/components/atoms/year-selector/YearSelector';
import { useSettings } from '@/contexts/SettingsContext';
import {
  useInvestmentChartData,
  useInvestmentPageData,
  usePlansChartData,
  usePositionsChartData,
} from '@/hooks/investment.hooks';
import { formatCurrency, formatCurrencyCompact } from '@/utils/format.util';
import { getEffectiveMonthlyTotal, getWeightedEntryFeeRate } from '@/utils/investmentCalculation.util';

const InvestmentsPage: FC = () => {
  const { settings, positionsTotal } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const { row, prevRow, yearGrowth, returnOnInvestment, isTargetReached, wasTargetReachedBefore } =
    useInvestmentPageData(yearIndex);
  const chartData = useInvestmentChartData();
  const positionsChartData = usePositionsChartData();
  const plansChartData = usePlansChartData();

  const effectiveMonthly = getEffectiveMonthlyTotal(settings.monthlyPlans);
  const avgEntryFeePercent = (getWeightedEntryFeeRate(settings.monthlyPlans) * 100).toFixed(1);

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
                Bruto: {formatCurrency(row.investmentValue)} · Na kosten, belasting en uitstapkosten
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
          <h2 className="detail-section__title">Posities</h2>
          <p className="detail-section__description">
            Eenmalig belegd · {settings.rate}% rendement · Prognose einde {row.year}
          </p>
          <ChartCard title={`Posities netto waarde — ${settings.startYear}–${settings.endYear}`} height={200}>
            <LineChart data={positionsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <Tooltip
                formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : String(value))}
                contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
              />
              <Line
                type="monotone"
                dataKey="netto"
                name="Netto waarde"
                stroke="var(--color-investment)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartCard>
          <div className="detail-grid">
            {settings.positions.map((pos) => (
              <DetailCard
                key={pos.ticker}
                label={pos.name}
                value={formatCurrency(pos.amount)}
                sub={`${pos.ticker} · ${((pos.amount / positionsTotal) * 100).toFixed(0)}% van posities`}
              />
            ))}
          </div>
          <div className="detail-grid">
            <DetailCard
              label="Posities waarde"
              value={formatCurrency(row.positionsNetValue)}
              sub={`Bruto: ${formatCurrency(row.positionsValue)} · Na ${(settings.transactionFeeRate * 100).toFixed(0)}% beurstaks en meerwaardetaks`}
              valueClassName="text-investment"
            />
            <DetailCard
              label="Posities winst"
              value={`+${formatCurrency(row.positionsValue - row.positionsInvested)}`}
              sub={`Ingelegd: ${formatCurrency(row.positionsInvested)}`}
              valueClassName="text-interest"
            />
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Beleggingsplannen</h2>
          <p className="detail-section__description">
            Maandelijks via Crelan · {settings.rate}% rendement · Prognose einde {row.year}
          </p>
          <ChartCard title={`Plannen netto waarde — ${settings.startYear}–${settings.endYear}`} height={200}>
            <LineChart data={plansChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
              <Tooltip
                formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : String(value))}
                contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
              />
              <Line
                type="monotone"
                dataKey="netto"
                name="Netto waarde"
                stroke="var(--color-pension)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartCard>
          <div className="detail-grid">
            {settings.monthlyPlans.map((plan) => (
              <DetailCard
                key={plan.isin}
                label={plan.name}
                value={`€${plan.monthlyAmount}/mnd`}
                sub={`${plan.isin} · Effectief €${(plan.monthlyAmount * (1 - plan.entryFeeRate)).toFixed(2)}/mnd na ${(plan.entryFeeRate * 100).toFixed(1)}% instapkost`}
              />
            ))}
          </div>
          <div className="detail-grid">
            <DetailCard
              label="Plannen waarde"
              value={formatCurrency(row.plansNetValue)}
              sub={`Bruto: ${formatCurrency(row.plansValue)} · Na uitstapkosten -${formatCurrency(row.plansExitFees)}`}
              valueClassName="text-investment"
            />
            <DetailCard
              label="Effectief belegd"
              value={formatCurrency(row.plansEffectiveInvested)}
              sub={`Nominaal: ${formatCurrency(row.plansInvested)} · Instapkosten: -${formatCurrency(row.plansEntryFees)}`}
            />
          </div>
          <p className="detail-section__disclaimer">
            Maandelijks €{row.investmentMonthly} bruto, effectief €{effectiveMonthly.toFixed(2)} na {avgEntryFeePercent}%
            instapkost (beheerd door Crelan).
          </p>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Kosten & belasting</h2>
          <p className="detail-section__description">
            Geschatte kosten bij verkoop einde {row.year}
          </p>
          <div className="detail-grid">
            <DetailCard
              label="Beurstaks + makelaar (posities)"
              value={`-${formatCurrency(row.positionsTransactionCosts)}`}
              sub={`${(settings.transactionFeeRate * 100).toFixed(0)}% op ${formatCurrency(row.positionsInvested)} inleg`}
              valueClassName="text-warn"
            />
            <DetailCard
              label="Meerwaardetaks (posities)"
              value={`-${formatCurrency(row.positionsCapitalGainsTax)}`}
              sub={`${(settings.capitalGainsTaxRate * 100).toFixed(0)}% per €10.000 winst`}
              valueClassName="text-warn"
            />
            <DetailCard
              label="Instapkosten (plannen)"
              value={`-${formatCurrency(row.plansEntryFees)}`}
              sub={`${avgEntryFeePercent}% per storting — al afgehouden`}
              valueClassName="text-warn"
            />
            <DetailCard
              label="Uitstapkosten (plannen)"
              value={`-${formatCurrency(row.plansExitFees)}`}
              sub="Op bruto waarde bij verkoop"
              valueClassName="text-warn"
            />
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Groei</h2>
          <p className="detail-section__description">
            Bruto groei op basis van {settings.rate}% jaarlijks rendement
          </p>
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

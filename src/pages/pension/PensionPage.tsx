import { useState, type FC } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import {
  BALOISE_FUND_NAME,
  BALOISE_ISIN,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  CRELAN_PENSION_FUND_NAME,
  CRELAN_PENSION_ISIN,
  CRELAN_RATE,
  CRELAN_START_VALUE,
} from '@config/investment.config';
import ChartCard from '@/components/atoms/chart-card/ChartCard';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useCurrentYearIndex, YearSelector } from '@/components/atoms/year-selector/YearSelector';
import { useSettings } from '@/contexts/SettingsContext';
import { usePensionChartData, usePensionPageData } from '@/hooks/investment.hooks';
import { formatCurrency, formatCurrencyCompact, formatTooltipCurrency } from '@/utils/format.util';
import { getAgeFromYear } from '@/utils/investmentCalculation.util';

const PensionPage: FC = () => {
  const { settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const { row, combined, year, recapturePercent, totalInterest, returnPercent } = usePensionPageData(yearIndex);
  const chartData = usePensionChartData();
  const age = getAgeFromYear(year);
  const baloiseMonthly = yearIndex === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027;

  return (
    <div className="page">
      <YearSelector value={yearIndex} onChange={setYearIndex} />

      <PageHeader
        title={`🏦 Pensioensparen — ${year}`}
        subtitle={`${age} jaar · Crelan ${(CRELAN_RATE * 100).toFixed(2)}%/jaar + Baloise ${(settings.baloiseRate * 100).toFixed(1)}%/jaar`}
      />

      <main className="page__main">
        <ChartCard title={`Inleg vs. winst — ${settings.startYear}–${settings.endYear}`} height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
            <YAxis tickFormatter={formatCurrencyCompact} tick={{ fontSize: 11 }} stroke="var(--color-muted)" />
            <Tooltip
              formatter={formatTooltipCurrency}
              contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="netto"
              name="Netto waarde"
              stackId="1"
              stroke="var(--color-pension)"
              fill="var(--color-pension)"
              fillOpacity={0.35}
            />
            <Area
              type="monotone"
              dataKey="terugvordering"
              name="Terugvordering"
              stackId="1"
              stroke="var(--color-muted)"
              fill="var(--color-muted)"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ChartCard>

        <div className="detail-grid">
          <DetailCard
            label="Totaal waarde"
            value={formatCurrency(combined.pensionNetValue)}
            sub={
              <>
                Bruto: {formatCurrency(row.valueTotal)} · Na {recapturePercent}% terugvordering (-
                {formatCurrency(combined.pensionRecapture)})
              </>
            }
            highlight
            valueClassName="detail-card__value--large text-pension"
          />
          <DetailCard
            label="Winst op inleg"
            value={`+${formatCurrency(totalInterest)} (+${returnPercent}%)`}
            sub={`Ingelegd: ${formatCurrency(row.investedTotal)}`}
            highlight
            valueClassName="detail-card__value--large text-interest"
          />
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Crelan ({(CRELAN_RATE * 100).toFixed(2)}%/jaar)</h2>
          <p className="detail-section__description">
            {CRELAN_PENSION_FUND_NAME} · ISIN: {CRELAN_PENSION_ISIN}
          </p>
          <div className="detail-grid">
            <DetailCard
              label="Ingelegd"
              value={formatCurrency(row.investedCrelan)}
              sub="Eenmalige storting — blijft staan"
              valueClassName="frozen"
            />
            <DetailCard
              label="Waarde"
              value={formatCurrency(row.valueCrelan)}
              sub={`+${formatCurrency(row.valueCrelan - CRELAN_START_VALUE)} rente`}
              valueClassName="text-pension"
            />
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Baloise ({(settings.baloiseRate * 100).toFixed(1)}%/jaar)</h2>
          <p className="detail-section__description">
            {BALOISE_FUND_NAME} · ISIN: {BALOISE_ISIN}
          </p>
          <div className="detail-grid">
            <DetailCard label="Ingelegd" value={formatCurrency(row.investedBaloise)} sub={`€${baloiseMonthly}/mnd`} />
            <DetailCard
              label="Waarde"
              value={formatCurrency(row.valueBaloise)}
              sub={`+${formatCurrency(row.valueBaloise - row.investedBaloise)} rente`}
              valueClassName="text-pension"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export { PensionPage };

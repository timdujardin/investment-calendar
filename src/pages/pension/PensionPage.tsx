import { useState, type FC } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import {
  BALOISE_AUTO_PAYMENT_COUNT_2026,
  BALOISE_CONTRACT_END_ISO,
  BALOISE_DEPOSIT_DAY_OF_MONTH,
  BALOISE_FIRST_AUTO_DATE_ISO,
  BALOISE_FUND_NAME,
  BALOISE_ISIN,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  BALOISE_OPENING_INVESTED_EUR,
  BALOISE_POLICY_NUMBER,
  CRELAN_PENSION_FUND_NAME,
  CRELAN_PENSION_ISIN,
  CRELAN_RATE,
  CRELAN_START_VALUE,
} from '@config/investment.config';
import ChartCard from '@/components/atoms/chart-card/ChartCard';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useCurrentYearIndex, YearSelector } from '@/components/atoms/year-selector/YearSelector';
import { BaloiseLivePosition } from '@/components/molecules/baloise-live-position/BaloiseLivePosition';
import { useSettings } from '@/contexts/SettingsContext';
import { usePensionChartData, usePensionPageData } from '@/hooks/investment.hooks';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatIsoDateNl,
  formatTooltipCurrency,
  getGainLossClass,
} from '@/utils/format.util';
import { getAgeFromYear } from '@/utils/investmentCalculation.util';

const PensionPage: FC = () => {
  const { settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const { row, combined, year, recapturePercent, totalInterest, returnPercent } = usePensionPageData(yearIndex);
  const chartData = usePensionChartData();
  const age = getAgeFromYear(year);
  const baloiseMonthly = yearIndex === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027;
  const baloiseInvestedSub =
    yearIndex === 0
      ? `${formatCurrency(BALOISE_OPENING_INVESTED_EUR)} reeds · +${BALOISE_AUTO_PAYMENT_COUNT_2026}×€${BALOISE_MONTHLY_2026} (mei–dec)`
      : `€${baloiseMonthly}/mnd · elke ${BALOISE_DEPOSIT_DAY_OF_MONTH}e`;

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
                {formatCurrency(row.valueCrelan)} Crelan + {formatCurrency(row.valueBaloise)} Baloise
                <br />
                Bruto: {formatCurrency(row.valueTotal)} · Na {recapturePercent}% terugvordering (-
                {formatCurrency(combined.pensionRecapture)})
              </>
            }
            highlight
            valueClassName="detail-card__value--large text-pension"
          />
          <DetailCard
            label="Winst op inleg"
            value={`${totalInterest >= 0 ? '+' : ''}${formatCurrency(totalInterest)} (${Number(returnPercent) >= 0 ? '+' : ''}${returnPercent}%)`}
            sub={`Ingelegd: ${formatCurrency(row.investedTotal)}`}
            highlight
            valueClassName={`detail-card__value--large ${getGainLossClass(totalInterest)}`}
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
              sub={
                <span className={getGainLossClass(row.valueCrelan - CRELAN_START_VALUE)}>
                  {row.valueCrelan - CRELAN_START_VALUE >= 0 ? '+' : ''}
                  {formatCurrency(row.valueCrelan - CRELAN_START_VALUE)} rente
                </span>
              }
              valueClassName="text-pension"
            />
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Baloise ({(settings.baloiseRate * 100).toFixed(1)}%/jaar)</h2>
          <p className="detail-section__description">
            Polis {BALOISE_POLICY_NUMBER} · einddatum contract {formatIsoDateNl(BALOISE_CONTRACT_END_ISO)}
            <br />
            {BALOISE_FUND_NAME} · ISIN: {BALOISE_ISIN}
            <br />
            {formatCurrency(BALOISE_OPENING_INVESTED_EUR)} stond er vóór automatische incasso; vanaf{' '}
            {formatIsoDateNl(BALOISE_FIRST_AUTO_DATE_ISO)} elke maand €{BALOISE_MONTHLY_2026} tot eind 2026. Vanaf 2027
            elke {BALOISE_DEPOSIT_DAY_OF_MONTH}e €{BALOISE_MONTHLY_FROM_2027}. De projectie gebruikt maandrente uit je
            jaarpct en één storting per maand.
          </p>
          <div className="detail-grid">
            <DetailCard
              label="Ingelegd (projectie)"
              value={formatCurrency(row.investedBaloise)}
              sub={baloiseInvestedSub}
            />
            <DetailCard
              label="Waarde (projectie)"
              value={formatCurrency(row.valueBaloise)}
              sub={
                <span className={getGainLossClass(row.valueBaloise - row.investedBaloise)}>
                  {row.valueBaloise - row.investedBaloise >= 0 ? '+' : ''}
                  {formatCurrency(row.valueBaloise - row.investedBaloise)} rente
                </span>
              }
              valueClassName="text-pension"
            />
          </div>
          <h3 className="detail-section__subtitle">Live positie — exact op je stortingen</h3>
          <BaloiseLivePosition />
        </div>
      </main>
    </div>
  );
};

export { PensionPage };

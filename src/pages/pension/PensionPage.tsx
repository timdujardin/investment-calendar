import { useState, type FC } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import {
  BALOISE_CONTRACT_END_ISO,
  BALOISE_ENTRY_COST_RATE,
  BALOISE_FIRST_PERIOD_START_ISO,
  BALOISE_FIRST_YEAR_INVESTED_TOTAL,
  BALOISE_FUND_NAME,
  BALOISE_ISIN,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  BALOISE_PERIOD_START_DAY,
  BALOISE_POLICY_NUMBER,
  CRELAN_FIRST_DEPOSIT_ISO,
  CRELAN_LAST_DEPOSIT_ISO,
  CRELAN_MONTHLY,
  CRELAN_PENSION_FUND_NAME,
  CRELAN_PENSION_ISIN,
  CRELAN_RATE,
} from '@config/investment.config';
import ChartCard from '@/components/atoms/chart-card/ChartCard';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useCurrentYearIndex, YearSelector } from '@/components/atoms/year-selector/YearSelector';
import { useSettings } from '@/contexts/SettingsContext';
import { usePensionChartData, usePensionPageData } from '@/hooks/investment.hooks';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatIsoDateNl,
  formatTooltipCurrency,
  getGainLossClass,
} from '@/utils/format.util';
import { CRELAN_DEPOSIT_COUNT } from '@/utils/crelanPosition.util';
import { getAgeFromYear } from '@/utils/investmentCalculation.util';

import { BaloiseFundPosition } from './_components/baloise-fund-position/BaloiseFundPosition';
import { BaloisePremiumTable } from './_components/baloise-premium-table/BaloisePremiumTable';
import { CrelanFundPosition } from './_components/crelan-fund-position/CrelanFundPosition';

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
      ? `10 × €${BALOISE_MONTHLY_2026} (maart–dec) = ${formatCurrency(BALOISE_FIRST_YEAR_INVESTED_TOTAL)}`
      : `€${baloiseMonthly}/mnd · periode vanaf elke ${BALOISE_PERIOD_START_DAY}e`;
  const crelanDepositSub = `${CRELAN_DEPOSIT_COUNT} × €${CRELAN_MONTHLY}`;

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
            <br />€{CRELAN_MONTHLY} per maand van {formatIsoDateNl(CRELAN_FIRST_DEPOSIT_ISO)} tot{' '}
            {formatIsoDateNl(CRELAN_LAST_DEPOSIT_ISO)}. Sinds de overstap naar Baloise komt er niets meer bij: de
            projectie laat de bestaande waarde enkel nog renderen.
          </p>
          <div className="detail-grid">
            <DetailCard
              label="Ingelegd"
              value={formatCurrency(row.investedCrelan)}
              sub={`${crelanDepositSub} — afgesloten`}
            />
            <DetailCard
              label="Waarde (projectie)"
              value={formatCurrency(row.valueCrelan)}
              sub={
                <span className={getGainLossClass(row.valueCrelan - row.investedCrelan)}>
                  {row.valueCrelan - row.investedCrelan >= 0 ? '+' : ''}
                  {formatCurrency(row.valueCrelan - row.investedCrelan)} winst
                </span>
              }
              valueClassName="text-pension"
            />
          </div>
          <h3 className="detail-section__subtitle">Positie op slotkoers</h3>
          <CrelanFundPosition />
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Baloise ({(settings.baloiseRate * 100).toFixed(1)}%/jaar)</h2>
          <p className="detail-section__description">
            Polis {BALOISE_POLICY_NUMBER} · einddatum contract {formatIsoDateNl(BALOISE_CONTRACT_END_ISO)}
            <br />
            100% {BALOISE_FUND_NAME} · ISIN: {BALOISE_ISIN}
            <br />
            Premieperiodes lopen van de {BALOISE_PERIOD_START_DAY}e tot de {BALOISE_PERIOD_START_DAY}e, vanaf{' '}
            {formatIsoDateNl(BALOISE_FIRST_PERIOD_START_ISO)}. In 2026 €{BALOISE_MONTHLY_2026} per maand, vanaf 13/01/2027
            €{BALOISE_MONTHLY_FROM_2027} — telkens {formatCurrency(BALOISE_FIRST_YEAR_INVESTED_TOTAL)} per jaar, de
            maximale fiscale premie. Er gaat {(BALOISE_ENTRY_COST_RATE * 100).toFixed(0)}% instapkost af vóór aankoop.
            Er is geen domiciliëring, dus je stort zelf; de projectie hieronder rekent met één premie per maand.
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
          <h3 className="detail-section__subtitle">Positie op slotkoers</h3>
          <BaloiseFundPosition />
          <h3 className="detail-section__subtitle">Rendement per storting</h3>
          <BaloisePremiumTable />
        </div>
      </main>
    </div>
  );
};

export { PensionPage };

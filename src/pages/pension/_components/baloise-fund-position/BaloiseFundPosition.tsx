import { memo, type FC } from 'react';

import {
  BALOISE_ENTRY_COST_RATE,
  BALOISE_UNIT_DECIMALS,
  BALOISE_YAHOO_CHART_SYMBOL,
  BALOISE_YAHOO_QUOTE_URL,
} from '@config/investment.config';
import type { BaloisePosition, BaloisePremiumRow } from '@/@types/baloise';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import { useBaloisePosition } from '@/hooks/baloise.hooks';
import {
  formatCurrency,
  formatIsoMonthNl,
  formatSignedCurrency,
  formatSignedPercent,
  formatTimestampNl,
  getGainLossClass,
} from '@/utils/format.util';

const formatPremiumExtreme = (label: string, premium: BaloisePremiumRow | null): string =>
  premium == null
    ? `${label}: —`
    : `${label}: ${formatIsoMonthNl(premium.periodStartIso)} ${formatSignedPercent(premium.netReturnPercent, 1)}`;

interface PositionSummaryProps {
  position: BaloisePosition;
}

const PositionSummary: FC<PositionSummaryProps> = ({ position }) => {
  const { paidTotal, totalEntryCost, totalNetInvested, units, value, pnl, netReturnPercent } = position;
  const { averageCostNav, closeNav, closeDateMs, bestPremium, worstPremium, openAmount, hasMissingPeriod } = position;

  const hasPosition = units > 0 && closeNav != null;

  const investedSub = `${formatCurrency(totalEntryCost)} instapkosten (${(BALOISE_ENTRY_COST_RATE * 100).toFixed(0)}%) · ${formatCurrency(totalNetInvested)} belegd`;

  const valueSub = hasPosition ? (
    <>
      <span className={`${getGainLossClass(pnl)} detail-card__sub--pnl`}>
        {formatSignedCurrency(pnl)} ({formatSignedPercent(netReturnPercent)})
      </span>
      <br />
      {units.toFixed(BALOISE_UNIT_DECIMALS)} eenheden · gemiddelde aankoopkoers{' '}
      {averageCostNav != null ? formatCurrency(averageCostNav) : '—'}
    </>
  ) : (
    'Wachten op de eerste storting'
  );

  return (
    <>
      <p className="fund-position__asof">Slotkoers {formatTimestampNl(closeDateMs)}</p>
      <div className="detail-grid">
        <DetailCard label="Betaald tot vandaag" value={formatCurrency(paidTotal)} sub={investedSub} />
        <DetailCard
          label="Waarde op slotkoers"
          value={hasPosition ? formatCurrency(value) : '—'}
          sub={valueSub}
          valueClassName="text-pension"
        />
      </div>
      <p className="fund-position__meta">
        {formatPremiumExtreme('Beste storting', bestPremium)} · {formatPremiumExtreme('Slechtste', worstPremium)}
        {openAmount > 0 ? ` · ${formatCurrency(openAmount)} nog niet gestort` : ''}
      </p>
      {hasMissingPeriod ? (
        <p className="fund-position__status fund-position__status--warn">
          De huidige premieperiode staat nog niet in de ledger. Vul ze aan in `BALOISE_PREMIUMS`.
        </p>
      ) : null}
    </>
  );
};

const BaloiseFundPosition: FC = () => {
  const state = useBaloisePosition();

  if (state.status === 'loading') {
    return <p className="fund-position__status">Fondskoers ophalen…</p>;
  }

  if (state.status === 'error') {
    return (
      <p className="fund-position__status fund-position__status--error">
        Kan de fondskoers niet laden: {state.message}
      </p>
    );
  }

  return (
    <div className="fund-position">
      <PositionSummary position={state.position} />
      <p className="detail-section__disclaimer">
        Berekend op je werkelijke stortingen. Omdat Baloise niet publiceert op welke dag ze na een storting aankoopt,
        is de aankoopkoers het gemiddelde van de slotkoers op de betaaldag en die van de eerstvolgende handelsdag. Een
        kleine afwijking tegenover het jaarrapport van Baloise is dus normaal. Geen beleggingsadvies.{' '}
        <a className="fund-position__link" href={BALOISE_YAHOO_QUOTE_URL} target="_blank" rel="noreferrer">
          Yahoo Finance — {BALOISE_YAHOO_CHART_SYMBOL}
        </a>
      </p>
    </div>
  );
};

const MemoBaloiseFundPosition = memo(BaloiseFundPosition);
export { MemoBaloiseFundPosition as BaloiseFundPosition };

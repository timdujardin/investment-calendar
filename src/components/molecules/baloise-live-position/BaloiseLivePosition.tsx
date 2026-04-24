import { memo, useMemo, type FC } from 'react';

import {
  BALOISE_YAHOO_CHART_SYMBOL,
  BALOISE_YAHOO_QUOTE_URL,
} from '@config/investment.config';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import { useBaloiseYahooChart } from '@/hooks/baloiseQuote.hooks';
import { computeBaloisePosition } from '@/utils/baloisePositionPnl.util';
import { formatCurrency } from '@/utils/format.util';

const UNIT_DECIMALS = 4;

const formatSignedPct = (pct: number | null): string => {
  if (pct == null) {
    return '—';
  }
  const sign = pct >= 0 ? '+' : '';

  return `${sign}${pct.toFixed(2)}%`;
};

const formatSignedCurrency = (amount: number): string => {
  const sign = amount >= 0 ? '+' : '';

  return `${sign}${formatCurrency(amount)}`;
};

const BaloiseLivePosition: FC = () => {
  const quote = useBaloiseYahooChart();

  const position = useMemo(() => {
    if (quote.status !== 'ready') {
      return null;
    }

    return computeBaloisePosition({
      rows: quote.chart.rows,
      lastNav: quote.chart.lastNav,
    });
  }, [quote]);

  if (quote.status === 'idle' || quote.status === 'loading') {
    return <p className="baloise-live-position__status">Live fondskoers ophalen…</p>;
  }

  if (quote.status === 'error') {
    return (
      <p className="baloise-live-position__status baloise-live-position__status--error">
        Kan live fondskoers niet laden: {quote.message}
      </p>
    );
  }

  if (position == null) {
    return null;
  }

  const {
    invested,
    units,
    value,
    pnl,
    pnlPercent,
    lastNav,
  } = position;
  const pnlClass = pnl >= 0 ? 'text-gain' : 'text-loss';
  const navLabel = lastNav != null ? formatCurrency(lastNav) : '—';
  const hasPosition = units > 0 && lastNav != null;

  const unitsSub = hasPosition
    ? `${units.toFixed(UNIT_DECIMALS)} eenheden × Live koers: ${navLabel}`
    : 'Nog geen units ingekocht';

  const valueSub = hasPosition ? (
    <span className={`${pnlClass} detail-card__sub--pnl`}>
      {formatSignedCurrency(pnl)} ({formatSignedPct(pnlPercent)})
    </span>
  ) : (
    'Wachten op eerste storting'
  );

  return (
    <div className="baloise-live-position">
      <div className="detail-grid">
        <DetailCard
          label="Ingelegd tot vandaag"
          value={formatCurrency(invested)}
          sub={unitsSub}
        />
        <DetailCard
          label="Actuele waarde"
          value={hasPosition ? formatCurrency(value) : '—'}
          sub={valueSub}
        />
      </div>
      <p className="detail-section__disclaimer">
        Berekend op je opgegeven premies (elke {13}e van de maand) met de NAV van de Yahoo-handelsdag op
        (of vlak vóór) de stortingsdatum. Kleine afwijking t.o.v. het officiële Baloise-overzicht is
        normaal (Baloise gebruikt een eigen dag-NAV en koopt soms met enkele dagen vertraging). Geen
        beleggingsadvies.{' '}
        <a
          className="baloise-live__link"
          href={BALOISE_YAHOO_QUOTE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Yahoo Finance — {BALOISE_YAHOO_CHART_SYMBOL}
        </a>
      </p>
    </div>
  );
};

const MemoBaloiseLivePosition = memo(BaloiseLivePosition);
export { MemoBaloiseLivePosition as BaloiseLivePosition };

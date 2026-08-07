import { memo, type FC } from 'react';

import {
  CRELAN_LAST_KNOWN_NAV_DATE_ISO,
  CRELAN_UNIT_DECIMALS,
  CRELAN_YAHOO_CHART_SYMBOL,
  CRELAN_YAHOO_QUOTE_URL,
} from '@config/investment.config';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import { useCrelanPosition } from '@/hooks/crelan.hooks';
import {
  formatCurrency,
  formatIsoDateNl,
  formatSignedCurrency,
  formatSignedPercent,
  formatTimestampNl,
  getGainLossClass,
} from '@/utils/format.util';
import { CRELAN_DEPOSIT_COUNT } from '@/utils/crelanPosition.util';

const CrelanFundPosition: FC = () => {
  const { invested, units, value, pnl, returnPercent, averageCostNav, nav, navDateMs, navIsFallback } =
    useCrelanPosition();

  const asOf = navIsFallback
    ? `Laatst bekende koers ${formatIsoDateNl(CRELAN_LAST_KNOWN_NAV_DATE_ISO)}`
    : `Slotkoers ${formatTimestampNl(navDateMs)}`;

  return (
    <div className="fund-position">
      <p className="fund-position__asof">
        {asOf} · {formatCurrency(nav)}
      </p>
      <div className="detail-grid">
        <DetailCard
          label="Gestort (geschat)"
          value={formatCurrency(invested)}
          sub={`${CRELAN_DEPOSIT_COUNT} maandelijkse stortingen · gemiddelde aankoopkoers ${averageCostNav != null ? formatCurrency(averageCostNav) : '—'}`}
        />
        <DetailCard
          label="Waarde op slotkoers"
          value={formatCurrency(value)}
          sub={
            <>
              <span className={`${getGainLossClass(pnl)} detail-card__sub--pnl`}>
                {formatSignedCurrency(pnl)} ({formatSignedPercent(returnPercent)})
              </span>
              <br />
              {units.toFixed(CRELAN_UNIT_DECIMALS)} eenheden
            </>
          }
          valueClassName="text-pension"
        />
      </div>
      {navIsFallback ? (
        <p className="fund-position__status fund-position__status--warn">
          De live koers is niet beschikbaar; de waardering gebruikt de laatst bekende koers uit je Crelan-overzicht.
        </p>
      ) : null}
      <p className="detail-section__disclaimer">
        Het aantal eenheden komt rechtstreeks van je Crelan-overzicht, dus de waarde is exact. Het gestorte bedrag staat
        er niet op en is een reconstructie; tegen de werkelijke fondskoersen lijkt het zo&apos;n € 470 te laag, waardoor
        winst en rendement hier geflatteerd zijn. Vind je het echte bedrag op een fiscaal attest, vul dan
        `CRELAN_INVESTED_TOTAL` in. Geen beleggingsadvies.{' '}
        <a className="fund-position__link" href={CRELAN_YAHOO_QUOTE_URL} target="_blank" rel="noreferrer">
          Yahoo Finance — {CRELAN_YAHOO_CHART_SYMBOL}
        </a>
      </p>
    </div>
  );
};

const MemoCrelanFundPosition = memo(CrelanFundPosition);
export { MemoCrelanFundPosition as CrelanFundPosition };

import { memo, type FC } from 'react';

import {
  CRELAN_LAST_KNOWN_NAV_DATE_ISO,
  CRELAN_SWITCH_ISO,
  CRELAN_SWITCH_VALUE,
  CRELAN_UNIT_DECIMALS,
  CRELAN_YAHOO_CHART_SYMBOL,
  CRELAN_YAHOO_QUOTE_URL,
} from '@config/investment.config';
import DetailCard from '@/components/atoms/detail-card/DetailCard';
import { useCrelanPosition } from '@/hooks/crelan.hooks';
import { CRELAN_DEPOSIT_COUNT } from '@/utils/crelanPosition.util';
import {
  formatCurrency,
  formatIsoDateNl,
  formatSignedCurrency,
  formatSignedPercent,
  formatTimestampNl,
  getGainLossClass,
} from '@/utils/format.util';

const CrelanFundPosition: FC = () => {
  const {
    invested,
    units,
    unitsAreEstimated,
    value,
    pnl,
    returnPercent,
    averageCostNav,
    nav,
    navDateMs,
    navIsFallback,
  } = useCrelanPosition();

  const asOf = navIsFallback
    ? `Laatst bekende koers ${formatIsoDateNl(CRELAN_LAST_KNOWN_NAV_DATE_ISO)}`
    : `Slotkoers ${formatTimestampNl(navDateMs)}`;

  const unitsLabel = `${unitsAreEstimated ? '± ' : ''}${units.toFixed(CRELAN_UNIT_DECIMALS)} eenheden`;

  return (
    <div className="fund-position">
      <p className="fund-position__asof">
        {asOf} · {formatCurrency(nav)}
      </p>
      <div className="detail-grid">
        <DetailCard
          label="Gestort (geschat)"
          value={formatCurrency(invested)}
          sub={`${CRELAN_DEPOSIT_COUNT} maandelijkse stortingen · break-evenkoers ${averageCostNav != null ? formatCurrency(averageCostNav) : '—'}`}
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
              {unitsLabel}
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
      {unitsAreEstimated ? (
        <p className="fund-position__status fund-position__status--warn">
          Je Crelan-overzicht toont na de wissel van {formatIsoDateNl(CRELAN_SWITCH_ISO)} nog geen eenheden. Zolang dat
          duurt zijn ze geschat uit de {formatCurrency(CRELAN_SWITCH_VALUE)} die mee verhuisde, gedeeld door de koers
          van die dag.
        </p>
      ) : null}
      <p className="detail-section__disclaimer">
        Sinds de wissel van BNP Paribas B Pension Balanced naar Growth staat er meer in aandelen en minder in
        staatsobligaties. Er verhuisde enkel waarde, geen nieuwe inleg. Dat gestorte bedrag staat niet op het overzicht
        en is een reconstructie; tegen de werkelijke koersen van het oude fonds lijkt het zo&apos;n € 470 te laag,
        waardoor winst en rendement hier geflatteerd zijn. Geen beleggingsadvies.{' '}
        <a className="fund-position__link" href={CRELAN_YAHOO_QUOTE_URL} target="_blank" rel="noreferrer">
          Yahoo Finance — {CRELAN_YAHOO_CHART_SYMBOL}
        </a>
      </p>
    </div>
  );
};

const MemoCrelanFundPosition = memo(CrelanFundPosition);
export { MemoCrelanFundPosition as CrelanFundPosition };

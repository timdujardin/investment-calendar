import { memo, type FC } from 'react';

import { BALOISE_UNIT_DECIMALS } from '@config/investment.config';
import type { BaloisePosition, BaloisePremiumRow } from '@/@types/baloise';
import { useBaloisePosition } from '@/hooks/baloise.hooks';
import {
  formatCurrency,
  formatIsoMonthNl,
  formatSignedCurrency,
  formatSignedPercent,
  formatTimestampNl,
  getGainLossClass,
} from '@/utils/format.util';

import {
  formatDaysHeldCell,
  formatNavCell,
  formatPaidOnCell,
  formatPurchaseNavCell,
  formatUnitsCell,
} from './baloise-premium-table.util';

const COLUMNS = [
  'Periode',
  'Betaald op',
  'Betaald',
  'Instapkost',
  'Belegd',
  'Koers dag',
  'Koers dag+1',
  'Aankoopkoers',
  'Eenheden',
  'Waarde',
  'Winst/verlies',
  'Fonds',
  'Aangehouden',
] as const;

const PremiumRow: FC<{ premium: BaloisePremiumRow }> = ({ premium }) => {
  const rowClass = premium.isPaid ? undefined : 'data-table__row--muted';

  return (
    <tr className={rowClass}>
      <td>{formatIsoMonthNl(premium.periodStartIso)}</td>
      <td>{formatPaidOnCell(premium.paidOnIso, premium.periodEndIso)}</td>
      <td className="data-table__cell--number">{formatCurrency(premium.amount)}</td>
      <td className="data-table__cell--number">{premium.isPaid ? formatCurrency(premium.entryCost) : '—'}</td>
      <td className="data-table__cell--number">{premium.isPaid ? formatCurrency(premium.netInvested) : '—'}</td>
      <td className="data-table__cell--number">{formatNavCell(premium.navSameDay)}</td>
      <td className="data-table__cell--number">{formatNavCell(premium.navNextDay)}</td>
      <td className="data-table__cell--number">
        {formatPurchaseNavCell(premium.purchaseNav, premium.navIsApproximate)}
      </td>
      <td className="data-table__cell--number">{formatUnitsCell(premium.units)}</td>
      <td className="data-table__cell--number">{premium.units > 0 ? formatCurrency(premium.valueNow) : '—'}</td>
      <td className={`data-table__cell--number ${premium.units > 0 ? getGainLossClass(premium.pnl) : ''}`}>
        {premium.units > 0
          ? `${formatSignedCurrency(premium.pnl)} (${formatSignedPercent(premium.netReturnPercent, 1)})`
          : '—'}
      </td>
      <td className="data-table__cell--number data-table__cell--muted">
        {formatSignedPercent(premium.fundReturnPercent, 1)}
      </td>
      <td className="data-table__cell--number">{formatDaysHeldCell(premium.daysHeld)}</td>
    </tr>
  );
};

const TotalsRow: FC<{ position: BaloisePosition }> = ({ position }) => (
  <tr className="data-table__row--total">
    <td colSpan={2}>Totaal</td>
    <td className="data-table__cell--number">{formatCurrency(position.paidTotal)}</td>
    <td className="data-table__cell--number">{formatCurrency(position.totalEntryCost)}</td>
    <td className="data-table__cell--number">{formatCurrency(position.totalNetInvested)}</td>
    <td colSpan={2} />
    <td className="data-table__cell--number">
      {position.averageCostNav != null ? formatCurrency(position.averageCostNav) : '—'}
    </td>
    <td className="data-table__cell--number">{position.units.toFixed(BALOISE_UNIT_DECIMALS)}</td>
    <td className="data-table__cell--number">{formatCurrency(position.value)}</td>
    <td className={`data-table__cell--number ${getGainLossClass(position.pnl)}`}>
      {formatSignedCurrency(position.pnl)} ({formatSignedPercent(position.netReturnPercent, 1)})
    </td>
    <td className="data-table__cell--number data-table__cell--muted">
      {formatSignedPercent(position.fundReturnPercent, 1)}
    </td>
    <td />
  </tr>
);

const BaloisePremiumTable: FC = () => {
  const state = useBaloisePosition();

  if (state.status !== 'ready') {
    return null;
  }

  const { position } = state;

  return (
    <div className="baloise-premium-table">
      <p className="fund-position__asof">
        Waarde en rendement op de slotkoers van {formatTimestampNl(position.closeDateMs)}
        {position.closeNav != null ? ` (${formatCurrency(position.closeNav)})` : ''}
      </p>
      <div className="data-table-wrap">
        <table className="data-table">
          <caption className="data-table__caption">
            Alle premieperiodes met hun werkelijke betaaldatum en het rendement per storting
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {position.premiums.map((premium) => (
              <PremiumRow key={premium.periodStartIso} premium={premium} />
            ))}
          </tbody>
          <tfoot>
            <TotalsRow position={position} />
          </tfoot>
        </table>
      </div>
      <p className="detail-section__disclaimer">
        Winst/verlies is berekend tegenover wat je betaalde, dus inclusief de instapkost. De kolom Fonds toont wat het
        fonds zelf deed sinds die instap. Een aankoopkoers met ± berust nog op één handelsdag, omdat de dag erna nog
        niet gepubliceerd is.
      </p>
    </div>
  );
};

const MemoBaloisePremiumTable = memo(BaloisePremiumTable);
export { MemoBaloisePremiumTable as BaloisePremiumTable };

import { BALOISE_UNIT_DECIMALS } from '@config/investment.config';
import { formatCurrency, formatIsoDateShortNl } from '@/utils/format.util';

const EMPTY_CELL = '—';

/** Koers of `—` zolang er geen handelsdag gevonden is. */
export const formatNavCell = (nav: number | null): string => (nav == null ? EMPTY_CELL : formatCurrency(nav));

export const formatUnitsCell = (units: number): string => (units > 0 ? units.toFixed(BALOISE_UNIT_DECIMALS) : EMPTY_CELL);

/** Betaaldag, of tot wanneer de periode nog openstaat. */
export const formatPaidOnCell = (paidOnIso: string | null, periodEndIso: string): string =>
  paidOnIso == null ? `Open tot ${formatIsoDateShortNl(periodEndIso)}` : formatIsoDateShortNl(paidOnIso);

export const formatDaysHeldCell = (daysHeld: number | null): string =>
  daysHeld == null ? EMPTY_CELL : `${daysHeld} d`;

/** Markeert een aankoopkoers die nog op één handelsdag berust. */
export const formatPurchaseNavCell = (purchaseNav: number | null, isApproximate: boolean): string => {
  if (purchaseNav == null) {
    return EMPTY_CELL;
  }

  return isApproximate ? `± ${formatCurrency(purchaseNav)}` : formatCurrency(purchaseNav);
};

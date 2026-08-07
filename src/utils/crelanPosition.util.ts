import {
  CRELAN_FIRST_DEPOSIT_ISO,
  CRELAN_INVESTED_TOTAL,
  CRELAN_LAST_DEPOSIT_ISO,
  CRELAN_LAST_KNOWN_NAV,
  CRELAN_UNITS,
} from '@config/investment.config';
import type { CrelanPosition } from '@/@types/crelan';

/**
 * Aantal maandelijkse stortingen tussen twee datums, beide inbegrepen. Alleen jaar en
 * maand tellen: de exacte dag verschoof door de jaren heen en doet er voor het totaal
 * niet toe.
 */
export const countMonthlyDeposits = (firstIso: string, lastIso: string): number => {
  const [firstYear, firstMonth] = firstIso.split('-').map(Number);
  const [lastYear, lastMonth] = lastIso.split('-').map(Number);

  if ([firstYear, firstMonth, lastYear, lastMonth].some((n) => n == null || Number.isNaN(n))) {
    return 0;
  }

  const months = (lastYear - firstYear) * 12 + (lastMonth - firstMonth) + 1;

  return Math.max(months, 0);
};

export const CRELAN_DEPOSIT_COUNT = countMonthlyDeposits(CRELAN_FIRST_DEPOSIT_ISO, CRELAN_LAST_DEPOSIT_ISO);

interface CrelanPositionInput {
  /** Laatste slotkoers, of `null` zolang die niet geladen is. */
  nav: number | null;
  navDateMs: number | null;
}

/**
 * Waardeert de positie tegen `nav`, met de laatst bekende koers uit de config als terugval.
 * Daardoor is er altijd een bruikbare waarde en hoeft niets op het netwerk te wachten.
 */
export const computeCrelanPosition = (input: CrelanPositionInput): CrelanPosition => {
  const navIsFallback = input.nav == null;
  const nav = input.nav ?? CRELAN_LAST_KNOWN_NAV;

  const invested = CRELAN_INVESTED_TOTAL;
  const value = CRELAN_UNITS * nav;
  const pnl = value - invested;

  return {
    invested,
    units: CRELAN_UNITS,
    value,
    pnl,
    returnPercent: invested > 0 ? (pnl / invested) * 100 : null,
    averageCostNav: CRELAN_UNITS > 0 ? invested / CRELAN_UNITS : null,
    nav,
    navDateMs: navIsFallback ? null : input.navDateMs,
    navIsFallback,
  };
};

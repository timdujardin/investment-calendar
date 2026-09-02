import {
  CRELAN_FIRST_DEPOSIT_ISO,
  CRELAN_INVESTED_TOTAL,
  CRELAN_LAST_DEPOSIT_ISO,
  CRELAN_LAST_KNOWN_NAV,
  CRELAN_SWITCH_NAV,
  CRELAN_SWITCH_VALUE,
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

/**
 * Het aantal eenheden na de fondswissel. Zolang het Crelan-overzicht ze nog niet toont, is
 * het beste dat we hebben de waarde die verhuisde, gedeeld door de koers rond de wisseldatum.
 * De eenheden van het oude fonds gebruiken zou de positie met duizenden euro's naast de
 * werkelijkheid zetten, want die koers lag ruim boven die van Growth.
 */
const resolveUnits = (): { units: number; unitsAreEstimated: boolean } => {
  if (CRELAN_UNITS != null) {
    return { units: CRELAN_UNITS, unitsAreEstimated: false };
  }

  const estimated = CRELAN_SWITCH_NAV > 0 ? CRELAN_SWITCH_VALUE / CRELAN_SWITCH_NAV : 0;

  return { units: estimated, unitsAreEstimated: true };
};

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
  const { units, unitsAreEstimated } = resolveUnits();

  const invested = CRELAN_INVESTED_TOTAL;
  const value = units * nav;
  const pnl = value - invested;

  return {
    invested,
    units,
    unitsAreEstimated,
    value,
    pnl,
    returnPercent: invested > 0 ? (pnl / invested) * 100 : null,
    averageCostNav: units > 0 ? invested / units : null,
    nav,
    navDateMs: navIsFallback ? null : input.navDateMs,
    navIsFallback,
  };
};

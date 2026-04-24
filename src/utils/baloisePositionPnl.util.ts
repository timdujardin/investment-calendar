import {
  BALOISE_DEPOSIT_DAY_OF_MONTH,
  BALOISE_FIRST_AUTO_DATE_ISO,
  BALOISE_INITIAL_DEPOSITS,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
} from '@config/investment.config';
import type { BaloiseChartRow } from '@/utils/baloiseYahooChart.util';

/** Eén geplande of verwerkte premie. */
export interface BaloiseScheduledDeposit {
  dateIso: string;
  amount: number;
  source: 'initial' | 'auto';
}

/** Premie waarvoor we een NAV (en dus units) hebben berekend. */
export interface BaloiseFilledDeposit extends BaloiseScheduledDeposit {
  dateMs: number;
  nav: number;
  units: number;
  /** True als we géén exacte handelsdag-NAV binnen ~5 dagen vonden en dus benaderen. */
  navIsApproximate: boolean;
}

export interface BaloisePosition {
  invested: number;
  units: number;
  value: number;
  pnl: number;
  pnlPercent: number | null;
  lastNav: number | null;
  lastNavDateMs: number | null;
  deposits: BaloiseFilledDeposit[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Max aantal maandelijkse auto-premies om te genereren (veiligheidsplafond). */
const MAX_AUTO_MONTHS = 12 * 50;
/** Binnen hoeveel dagen rond de stortingsdatum beschouwen we een NAV als 'exact'. */
const EXACT_NAV_WINDOW_DAYS = 5;

const parseIsoDateMs = (iso: string): number | null => {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3) {
    return null;
  }
  const [y, m, d] = parts;
  if (y == null || m == null || d == null) {
    return null;
  }
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return null;
  }

  return new Date(y, m - 1, d).getTime();
};

const toIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const startOfDay = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const autoAmountForYear = (year: number): number => (year >= 2027 ? BALOISE_MONTHLY_FROM_2027 : BALOISE_MONTHLY_2026);

/**
 * Bouwt het volledige stortingsschema tot en met `today`: eerst de manueel doorgegeven
 * initiële stortingen, dan elke `BALOISE_DEPOSIT_DAY_OF_MONTH` vanaf de eerste automatische
 * incasso (`BALOISE_FIRST_AUTO_DATE_ISO`) met het juiste bedrag per jaar.
 */
export const buildBaloiseDepositSchedule = (today: Date): BaloiseScheduledDeposit[] => {
  const schedule: BaloiseScheduledDeposit[] = BALOISE_INITIAL_DEPOSITS.map((d) => ({
    dateIso: d.dateIso,
    amount: d.amount,
    source: 'initial',
  }));

  const firstAuto = parseIsoDateMs(BALOISE_FIRST_AUTO_DATE_ISO);
  if (firstAuto == null) {
    schedule.sort((a, b) => a.dateIso.localeCompare(b.dateIso));

    return schedule;
  }

  const todayMs = startOfDay(today);
  const first = new Date(firstAuto);
  let year = first.getFullYear();
  let month = first.getMonth();

  for (let i = 0; i < MAX_AUTO_MONTHS; i++) {
    const depositDate = new Date(year, month, BALOISE_DEPOSIT_DAY_OF_MONTH);
    if (depositDate.getTime() > todayMs) {
      break;
    }
    schedule.push({
      dateIso: toIsoDate(depositDate),
      amount: autoAmountForYear(year),
      source: 'auto',
    });
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  schedule.sort((a, b) => a.dateIso.localeCompare(b.dateIso));

  return schedule;
};

/**
 * Zoekt de laatste handelsdag-NAV op of vóór `timestampMs` (binaire zoek).
 * `rows` wordt oplopend gesorteerd verondersteld.
 */
const navAtOrBefore = (
  rows: readonly BaloiseChartRow[],
  timestampMs: number,
): { nav: number; approximate: boolean } | null => {
  if (rows.length === 0) {
    return null;
  }

  let lo = 0;
  let hi = rows.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].timeMs <= timestampMs) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (idx === -1) {
    return { nav: rows[0].nav, approximate: true };
  }

  const row = rows[idx];
  const diffDays = (timestampMs - row.timeMs) / MS_PER_DAY;

  return { nav: row.nav, approximate: diffDays > EXACT_NAV_WINDOW_DAYS };
};

export interface BaloisePositionInput {
  rows: readonly BaloiseChartRow[];
  lastNav: number | null;
  today?: Date;
}

/**
 * Berekent de live positie: voor elke reeds plaatsgevonden storting worden de units bepaald
 * op basis van de NAV op (of vlak vóór) die datum. De waarde volgt uit totaal aantal units
 * × huidige `lastNav`. Winst/verlies = waarde − ingelegd.
 */
export const computeBaloisePosition = (input: BaloisePositionInput): BaloisePosition => {
  const today = input.today ?? new Date();
  const schedule = buildBaloiseDepositSchedule(today);

  const deposits: BaloiseFilledDeposit[] = [];
  let invested = 0;
  let units = 0;

  for (const d of schedule) {
    const dateMs = parseIsoDateMs(d.dateIso);
    if (dateMs == null) {
      continue;
    }

    invested += d.amount;

    let nav: number | null = null;
    let approximate = true;
    const lookup = navAtOrBefore(input.rows, dateMs);
    if (lookup != null) {
      nav = lookup.nav;
      approximate = lookup.approximate;
    } else if (input.lastNav != null) {
      nav = input.lastNav;
    }

    if (nav != null && nav > 0) {
      const u = d.amount / nav;
      units += u;
      deposits.push({
        ...d,
        dateMs,
        nav,
        units: u,
        navIsApproximate: approximate,
      });
    }
  }

  const lastNavDateMs = input.rows.length > 0 ? input.rows[input.rows.length - 1].timeMs : null;
  const value = input.lastNav != null ? units * input.lastNav : 0;
  const pnl = value - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : null;

  return {
    invested,
    units,
    value,
    pnl,
    pnlPercent,
    lastNav: input.lastNav,
    lastNavDateMs,
    deposits,
  };
};

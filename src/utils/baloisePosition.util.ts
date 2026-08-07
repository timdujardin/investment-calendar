import {
  BALOISE_ENTRY_COST_RATE,
  BALOISE_EXACT_NAV_WINDOW_DAYS,
  BALOISE_LAST_PERIOD_START_ISO,
  BALOISE_PERIOD_START_DAY,
  BALOISE_PREMIUMS,
} from '@config/investment.config';
import type { BaloisePosition, BaloisePremium, BaloisePremiumRow } from '@/@types/baloise';
import type { FundQuoteRow } from '@/@types/fund';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

/** Een premieperiode loopt van de 13e tot de 13e van de volgende maand. */
const periodEndIsoFrom = (periodStartIso: string): string => {
  const ms = parseIsoDateMs(periodStartIso);
  if (ms == null) {
    return periodStartIso;
  }

  const start = new Date(ms);

  return toIsoDate(new Date(start.getFullYear(), start.getMonth() + 1, start.getDate()));
};

/** Laatste rij op of vóór `boundaryMs` (binaire zoek; `rows` is oplopend gesorteerd). */
const navAtOrBefore = (rows: readonly FundQuoteRow[], boundaryMs: number): FundQuoteRow | null => {
  let lo = 0;
  let hi = rows.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].timeMs <= boundaryMs) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return idx === -1 ? null : rows[idx];
};

/** Eerste rij strikt ná `boundaryMs`. */
const navFirstAfter = (rows: readonly FundQuoteRow[], boundaryMs: number): FundQuoteRow | null => {
  let lo = 0;
  let hi = rows.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].timeMs > boundaryMs) {
      idx = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  return idx === -1 ? null : rows[idx];
};

interface PurchaseNavLookup {
  navSameDay: number | null;
  navNextDay: number | null;
  purchaseNav: number | null;
  approximate: boolean;
}

/**
 * Baloise publiceert niet op welke dag ze na je storting effectief aankoopt, dus nemen we
 * het gemiddelde van de slotkoers op de betaaldag en die van de eerstvolgende handelsdag.
 * Zolang die tweede koers ontbreekt is het cijfer een benadering.
 *
 * De grens ligt op het einde van de betaaldag, niet op middernacht: dagbars dragen het
 * tijdstip van de handelssessie, dus een bar van de betaaldag zelf valt anders per ongeluk
 * al in "de dag erna".
 */
const resolvePurchaseNav = (
  rows: readonly FundQuoteRow[],
  paidMs: number,
  override: number | undefined,
): PurchaseNavLookup => {
  const endOfPaidDayMs = paidMs + MS_PER_DAY - 1;
  const sameDay = navAtOrBefore(rows, endOfPaidDayMs);
  const nextDay = navFirstAfter(rows, endOfPaidDayMs);
  const navSameDay = sameDay?.nav ?? null;
  const navNextDay = nextDay?.nav ?? null;

  if (override != null && override > 0) {
    return { navSameDay, navNextDay, purchaseNav: override, approximate: false };
  }

  if (navSameDay == null || navNextDay == null) {
    return { navSameDay, navNextDay, purchaseNav: navSameDay ?? navNextDay, approximate: true };
  }

  // Ligt de gevonden handelsdag te ver vóór de storting, dan is het geen echte dag-NAV meer.
  const daysBefore = Math.max(0, (paidMs - (sameDay?.timeMs ?? paidMs)) / MS_PER_DAY);

  return {
    navSameDay,
    navNextDay,
    purchaseNav: (navSameDay + navNextDay) / 2,
    approximate: daysBefore > BALOISE_EXACT_NAV_WINDOW_DAYS,
  };
};

interface PremiumBase {
  periodStartIso: string;
  periodEndIso: string;
  paidOnIso: string | null;
  amount: number;
}

const buildOpenPremiumRow = (base: PremiumBase): BaloisePremiumRow => ({
  ...base,
  isPaid: false,
  entryCost: 0,
  netInvested: 0,
  navSameDay: null,
  navNextDay: null,
  purchaseNav: null,
  navIsApproximate: false,
  units: 0,
  valueNow: 0,
  pnl: 0,
  netReturnPercent: null,
  fundReturnPercent: null,
  daysHeld: null,
});

interface PremiumContext {
  rows: readonly FundQuoteRow[];
  closeNav: number | null;
  todayMs: number;
}

interface PremiumValuation {
  units: number;
  valueNow: number;
  pnl: number;
  netReturnPercent: number | null;
  fundReturnPercent: number | null;
}

const UNVALUED: PremiumValuation = {
  units: 0,
  valueNow: 0,
  pnl: 0,
  netReturnPercent: null,
  fundReturnPercent: null,
};

/**
 * Winst en verlies staan tegenover het brutobedrag, niet tegenover wat er na instapkost
 * belegd is. Zo zie je of je er als betaler op vooruit bent, terwijl `fundReturnPercent`
 * apart laat zien hoe het fonds zelf presteerde.
 */
const valuePremium = (
  grossAmount: number,
  netInvested: number,
  purchaseNav: number | null,
  closeNav: number | null,
): PremiumValuation => {
  if (purchaseNav == null || purchaseNav <= 0 || closeNav == null) {
    return UNVALUED;
  }

  const units = netInvested / purchaseNav;
  const valueNow = units * closeNav;
  const pnl = valueNow - grossAmount;

  return {
    units,
    valueNow,
    pnl,
    netReturnPercent: grossAmount > 0 ? (pnl / grossAmount) * 100 : null,
    fundReturnPercent: (closeNav / purchaseNav - 1) * 100,
  };
};

const buildPaidPremiumRow = (
  base: PremiumBase,
  premium: BaloisePremium,
  paidMs: number,
  context: PremiumContext,
): BaloisePremiumRow => {
  const entryCost = premium.amount * BALOISE_ENTRY_COST_RATE;
  const netInvested = premium.amount - entryCost;
  const lookup = resolvePurchaseNav(context.rows, paidMs, premium.purchaseNavOverride);

  return {
    ...base,
    isPaid: true,
    entryCost,
    netInvested,
    navSameDay: lookup.navSameDay,
    navNextDay: lookup.navNextDay,
    purchaseNav: lookup.purchaseNav,
    navIsApproximate: lookup.approximate,
    ...valuePremium(premium.amount, netInvested, lookup.purchaseNav, context.closeNav),
    daysHeld: Math.max(0, Math.floor((context.todayMs - paidMs) / MS_PER_DAY)),
  };
};

const buildPremiumRow = (premium: BaloisePremium, context: PremiumContext): BaloisePremiumRow => {
  const base: PremiumBase = {
    periodStartIso: premium.periodStartIso,
    periodEndIso: periodEndIsoFrom(premium.periodStartIso),
    paidOnIso: premium.paidOnIso,
    amount: premium.amount,
  };

  const paidMs = premium.paidOnIso != null ? parseIsoDateMs(premium.paidOnIso) : null;

  return paidMs == null ? buildOpenPremiumRow(base) : buildPaidPremiumRow(base, premium, paidMs, context);
};

interface PremiumExtremes {
  bestPremium: BaloisePremiumRow | null;
  worstPremium: BaloisePremiumRow | null;
}

/**
 * Beste en slechtste storting op nettorendement. Wordt hier afgeleid zodat componenten
 * geen eigen zoeklogica over de premies hoeven te draaien.
 */
const pickPremiumExtremes = (premiums: readonly BaloisePremiumRow[]): PremiumExtremes => {
  let bestPremium: BaloisePremiumRow | null = null;
  let worstPremium: BaloisePremiumRow | null = null;

  for (const premium of premiums) {
    if (premium.netReturnPercent == null) {
      continue;
    }
    if (bestPremium?.netReturnPercent == null || premium.netReturnPercent > bestPremium.netReturnPercent) {
      bestPremium = premium;
    }
    if (worstPremium?.netReturnPercent == null || premium.netReturnPercent < worstPremium.netReturnPercent) {
      worstPremium = premium;
    }
  }

  return { bestPremium, worstPremium };
};

/** Periode waarin `today` valt: de 13e van deze of de vorige maand. */
const currentPeriodStartIso = (today: Date): string => {
  const monthOffset = today.getDate() >= BALOISE_PERIOD_START_DAY ? 0 : -1;

  return toIsoDate(new Date(today.getFullYear(), today.getMonth() + monthOffset, BALOISE_PERIOD_START_DAY));
};

export interface BaloisePositionInput {
  rows: readonly FundQuoteRow[];
  /** Koers uit de API-response; alleen gebruikt als de dagreeks leeg is. */
  fallbackNav: number | null;
  today: Date;
}

/**
 * Rekent de premie-ledger door tegen de laatst gepubliceerde dagslotkoers.
 *
 * Per betaalde premie gaat eerst de instapkost eraf; de rest koopt eenheden op de
 * geschatte aankoopkoers. Winst en verlies worden afgezet tegen het brutobedrag dat je
 * betaalde, zodat de instapkost zichtbaar in het rendement zit.
 */
export const computeBaloisePosition = (input: BaloisePositionInput): BaloisePosition => {
  const lastRow = input.rows.at(-1) ?? null;
  const closeNav = lastRow?.nav ?? input.fallbackNav;
  const closeDateMs = lastRow?.timeMs ?? null;

  const context: PremiumContext = { rows: input.rows, closeNav, todayMs: startOfDay(input.today) };
  const premiums = BALOISE_PREMIUMS.map((premium) => buildPremiumRow(premium, context));

  let paidTotal = 0;
  let openAmount = 0;
  let totalEntryCost = 0;
  let totalNetInvested = 0;
  let units = 0;
  let value = 0;

  for (const premium of premiums) {
    if (!premium.isPaid) {
      openAmount += premium.amount;
      continue;
    }
    paidTotal += premium.amount;
    totalEntryCost += premium.entryCost;
    totalNetInvested += premium.netInvested;
    units += premium.units;
    value += premium.valueNow;
  }

  const averageCostNav = units > 0 ? totalNetInvested / units : null;
  const totals = valuePremium(paidTotal, totalNetInvested, averageCostNav, closeNav);

  return {
    premiums,
    paidTotal,
    openAmount,
    totalEntryCost,
    totalNetInvested,
    units,
    value,
    pnl: totals.pnl,
    netReturnPercent: totals.netReturnPercent,
    fundReturnPercent: totals.fundReturnPercent,
    averageCostNav,
    closeNav,
    closeDateMs,
    ...pickPremiumExtremes(premiums),
    hasMissingPeriod: currentPeriodStartIso(input.today) > BALOISE_LAST_PERIOD_START_ISO,
  };
};

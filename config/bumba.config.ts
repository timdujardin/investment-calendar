export const MONTH_LABELS = [
  '',
  'jan',
  'feb',
  'mrt',
  'apr',
  'mei',
  'jun',
  'jul',
  'aug',
  'sep',
  'okt',
  'nov',
  'dec',
] as const;

export const A11Y_BUMPS = [
  { date: '2024-06', amount: 107.0 },
  { date: '2025-11', amount: 250.0 },
  { date: '2026-04', amount: 150.0 },
  { date: '2026-07', amount: 150.0 },
  { date: '2026-10', amount: 150.0 },
] as const;

/** Brutoloon waarboven de index niet meer volledig wordt toegekend. */
export const INDEX_CEILING = 4000;

export const INDEX_ADJUSTMENTS = [
  { date: '2025-01', rate: 0.0219 },
  { date: '2026-01', rate: 0.0221 },
  /**
   * Prognose: het definitieve percentage is pas rond de jaarwissel bekend. Blijf je onder het
   * plafond, dan krijg je de volle 4% op je hele brutoloon. Kom je erboven, dan valt het terug op
   * cappedRate per schijf: 4000 * 1,02 + het deel erboven * 1,02.
   */
  { date: '2027-01', rate: 0.04, cappedRate: 0.02 },
] as const;

/**
 * Van een brutoverhoging blijft na belasting dit deel over. Dit is nadrukkelijk niet de
 * bruto/netto-ratio van je loon zelf: die ligt rond 67% omdat ze over je hele loon gemiddeld is,
 * terwijl een verhoging bovenop je loon valt en daar de hoogste schijf op weegt.
 */
export const MARGINAL_NET_RATE = 13 / 30;

export const A11Y_START_DATE = '2024-06';

export const RATIO_CARRY_FORWARD_MONTHS: ReadonlySet<string> = new Set(['2025-07']);

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

export const INDEX_ADJUSTMENTS = [
  { date: '2025-01', rate: 0.0219 },
  { date: '2026-01', rate: 0.0221 },
] as const;

export const A11Y_START_DATE = '2024-06';

export const RATIO_CARRY_FORWARD_MONTHS: ReadonlySet<string> = new Set(['2025-07']);

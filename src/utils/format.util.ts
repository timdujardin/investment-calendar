export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(1)}k`;
  }

  return formatCurrency(value);
};

export const formatTooltipCurrency = (value: unknown): string =>
  typeof value === 'number' ? formatCurrency(value) : String(value);

export const formatTooltipCurrencyCompact = (value: unknown): string =>
  typeof value === 'number' ? formatCurrencyCompact(value) : String(value);

export const formatPercentTick = (v: number): string => `${v.toFixed(0)}%`;

export const formatDifference = (diff: number): string => {
  const prefix = diff >= 0 ? '+' : '';

  return `${prefix}${String(diff)}`;
};

/** `'text-gain'` bij ≥ 0, anders `'text-loss'`. Voor winst/verlies-kleuring in detail-kaarten. */
export const getGainLossClass = (amount: number): 'text-gain' | 'text-loss' =>
  amount >= 0 ? 'text-gain' : 'text-loss';

export const formatSignedCurrency = (amount: number): string =>
  `${amount >= 0 ? '+' : ''}${formatCurrency(amount)}`;

export const formatSignedPercent = (percent: number | null, fractionDigits = 2): string => {
  if (percent == null) {
    return '—';
  }

  return `${percent >= 0 ? '+' : ''}${percent.toFixed(fractionDigits)}%`;
};

/** `YYYY-MM-DD` → lokale `Date`, of `null` bij onzin. Vermijdt de UTC-shift van `new Date(iso)`. */
const parseIsoDate = (isoDate: string): Date | null => {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (y == null || m == null || d == null || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return null;
  }

  return new Date(y, m - 1, d);
};

/** Vandaag als `YYYY-MM-DD` in de lokale kalender, bruikbaar als `value` van een date-input. */
export const todayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${day}`;
};

/** `YYYY-MM-DD` → nl-BE datum (lokale kalender, geen UTC-shift). */
export const formatIsoDateNl = (isoDate: string): string => {
  const date = parseIsoDate(isoDate);

  return date == null
    ? isoDate
    : date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
};

/** `YYYY-MM-DD` → `31/03/2026`. */
export const formatIsoDateShortNl = (isoDate: string): string => {
  const date = parseIsoDate(isoDate);

  return date == null
    ? isoDate
    : date.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** `YYYY-MM-DD` → `maart 2026`. */
export const formatIsoMonthNl = (isoDate: string): string => {
  const date = parseIsoDate(isoDate);

  return date == null ? isoDate : date.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' });
};

/** Epoch-ms → nl-BE datum, of `—` als er nog geen koers is. */
export const formatTimestampNl = (timeMs: number | null): string =>
  timeMs == null
    ? '—'
    : new Date(timeMs).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });

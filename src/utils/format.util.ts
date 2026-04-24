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

/** `YYYY-MM-DD` → nl-BE datum (lokale kalender, geen UTC-shift). */
export const formatIsoDateNl = (isoDate: string): string => {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (y == null || m == null || d == null || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return isoDate;
  }

  return new Date(y, m - 1, d).toLocaleDateString('nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

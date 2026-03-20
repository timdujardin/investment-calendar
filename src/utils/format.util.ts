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

export const formatDifference = (diff: number): string => {
  const prefix = diff >= 0 ? '+' : '';

  return `${prefix}${String(diff)}`;
};

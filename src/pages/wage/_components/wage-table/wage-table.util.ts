import { formatCurrency } from '@/utils/format.util';

export const formatWageCell = (empty: boolean, value: number | null): string => {
  if (empty || value === null) {
    return '—';
  }

  return formatCurrency(value);
};

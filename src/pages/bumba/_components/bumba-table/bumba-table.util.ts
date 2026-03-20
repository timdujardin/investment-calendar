import { formatCurrency } from '@/utils/format.util';

export const formatBumbaCell = (empty: boolean, value: number | null): string => {
  if (empty || value === null) {
    return '—';
  }

  return formatCurrency(value);
};

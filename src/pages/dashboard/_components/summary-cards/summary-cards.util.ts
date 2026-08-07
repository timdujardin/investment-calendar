import type { CombinedYearRow } from '@/@types/investment';
import { formatCurrency } from '@/utils/format.util';

/** Verdeling van de netto eindstand over de vier potjes, met cash gesplitst per rekening. */
export const formatBreakdown = (row: CombinedYearRow): string =>
  [
    `Bolero: ${formatCurrency(row.positionsNetValue)}`,
    `Crelan: ${formatCurrency(row.plansNetValue)}`,
    `Pensioensparen: ${formatCurrency(row.pensionNetValue)}`,
    `Spaarrekening: ${formatCurrency(row.cashReserve)}`,
    `Bolero-cash: ${formatCurrency(row.boleroCash)}`,
  ].join(' · ');

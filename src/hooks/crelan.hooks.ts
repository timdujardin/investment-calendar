import { useMemo } from 'react';

import type { CrelanPosition } from '@/@types/crelan';
import { useFundQuotes } from '@/contexts/FundQuotesContext';
import { computeCrelanPosition } from '@/utils/crelanPosition.util';

/**
 * De Crelan-positie tegen de laatste koers.
 *
 * Er is geen laad- of foutstatus nodig: valt de koers weg, dan waardeert de util op de
 * laatst bekende koers uit de config en meldt ze dat via `navIsFallback`.
 */
export const useCrelanPosition = (): CrelanPosition => {
  const { crelan } = useFundQuotes();

  const chart = crelan.status === 'ready' ? crelan.chart : null;
  const rows = chart?.rows ?? [];
  const lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

  return useMemo(
    () => computeCrelanPosition({ nav: chart?.lastNav ?? null, navDateMs: lastRow?.timeMs ?? null }),
    [chart, lastRow],
  );
};

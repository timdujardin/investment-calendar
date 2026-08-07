import { useMemo, useState } from 'react';

import type { BaloisePosition } from '@/@types/baloise';
import { useFundQuotes } from '@/contexts/FundQuotesContext';
import { computeBaloisePosition } from '@/utils/baloisePosition.util';

export type BaloisePositionState =
  | { status: 'loading' }
  | { status: 'ready'; position: BaloisePosition }
  | { status: 'error'; message: string };

/**
 * De premie-ledger doorgerekend tegen de laatste slotkoers.
 *
 * `today` wordt eenmalig vastgelegd zodat de berekening zuiver blijft en het aantal
 * aangehouden dagen niet per render verspringt.
 */
export const useBaloisePosition = (): BaloisePositionState => {
  const { baloise: quote } = useFundQuotes();
  const [today] = useState(() => new Date());

  const chart = quote.status === 'ready' ? quote.chart : null;

  const position = useMemo(() => {
    if (chart == null) {
      return null;
    }

    return computeBaloisePosition({ rows: chart.rows, fallbackNav: chart.lastNav, today });
  }, [chart, today]);

  if (quote.status === 'error') {
    return { status: 'error', message: quote.message };
  }

  if (position == null) {
    return { status: 'loading' };
  }

  return { status: 'ready', position };
};

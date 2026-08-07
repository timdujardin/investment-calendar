import { useEffect, useState } from 'react';

import type { FundQuoteState } from '@/@types/fund';
import { fetchFundChartJson, parseFundQuoteResponse } from '@/utils/fundQuote.util';

/**
 * Haalt de koersreeks van één fonds op. Dit is een echte synchronisatie met een externe
 * bron, dus een Effect hoort hier thuis; de cleanup voorkomt dat een trage response van
 * een vorig symbool een nieuwere overschrijft.
 *
 * De status wordt bij een symboolwissel niet teruggezet naar `loading`: de aanroepers
 * geven module-constanten door, dus dat gebeurt nooit. Wordt het symbool ooit wél
 * dynamisch, geef de consument dan een `key` in plaats van hier state bij te sturen.
 */
export const useFundQuote = (symbol: string, range: string): FundQuoteState => {
  const [state, setState] = useState<FundQuoteState>({ status: 'loading' });

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const raw = await fetchFundChartJson(symbol, range, ac.signal);
        if (cancelled) {
          return;
        }
        const chart = parseFundQuoteResponse(raw);
        setState({ status: 'ready', chart });
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === 'AbortError')) {
          return;
        }
        const message = e instanceof Error ? e.message : 'Onbekende fout';
        setState({ status: 'error', message });
      }
    };

    void load();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [symbol, range]);

  return state;
};

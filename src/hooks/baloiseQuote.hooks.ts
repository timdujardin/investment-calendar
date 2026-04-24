import { useEffect, useState } from 'react';

import { BALOISE_YAHOO_CHART_RANGE, BALOISE_YAHOO_CHART_SYMBOL } from '@config/investment.config';
import { fetchFundChartJson, parseFundQuoteResponse, type BaloiseParsedChart } from '@/utils/baloiseYahooChart.util';

export type BaloiseQuoteState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; chart: BaloiseParsedChart }
  | { status: 'error'; message: string };

export const useBaloiseYahooChart = (): BaloiseQuoteState => {
  const [state, setState] = useState<BaloiseQuoteState>({ status: 'idle' });

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    const load = async (): Promise<void> => {
      setState({ status: 'loading' });
      try {
        const raw = await fetchFundChartJson(BALOISE_YAHOO_CHART_SYMBOL, BALOISE_YAHOO_CHART_RANGE, ac.signal);
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
  }, []);

  return state;
};

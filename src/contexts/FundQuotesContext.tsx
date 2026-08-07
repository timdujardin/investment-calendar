import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';

import {
  BALOISE_YAHOO_CHART_RANGE,
  BALOISE_YAHOO_CHART_SYMBOL,
  CRELAN_YAHOO_CHART_RANGE,
  CRELAN_YAHOO_CHART_SYMBOL,
} from '@config/investment.config';
import type { FundQuoteState } from '@/@types/fund';
import { useFundQuote } from '@/hooks/fundQuote.hooks';

interface FundQuotesContextValue {
  baloise: FundQuoteState;
  crelan: FundQuoteState;
}

const FundQuotesContext = createContext<FundQuotesContextValue | null>(null);

/**
 * Haalt beide fondskoersen één keer op en deelt ze. Zowel de projectie in
 * `InvestmentProvider` als de kaarten op de pensioenpagina hebben ze nodig; zonder deze
 * plek zou hetzelfde symbool meermaals opgevraagd worden.
 */
const FundQuotesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const baloise = useFundQuote(BALOISE_YAHOO_CHART_SYMBOL, BALOISE_YAHOO_CHART_RANGE);
  const crelan = useFundQuote(CRELAN_YAHOO_CHART_SYMBOL, CRELAN_YAHOO_CHART_RANGE);

  const value = useMemo(() => ({ baloise, crelan }), [baloise, crelan]);

  return <FundQuotesContext.Provider value={value}>{children}</FundQuotesContext.Provider>;
};

const useFundQuotes = () => {
  const ctx = useContext(FundQuotesContext);
  if (!ctx) {
    throw new Error('useFundQuotes must be used within FundQuotesProvider');
  }

  return ctx;
};

export { FundQuotesProvider, useFundQuotes };

/** Bron die de fondskoersen leverde. */
export type FundQuoteSource = 'finnhub' | 'yahoo';

/** Eén dagslotkoers uit de fondsreeks. */
export interface FundQuoteRow {
  timeMs: number;
  nav: number;
}

/** Genormaliseerde koersdata, ongeacht of ze via de Worker of rechtstreeks van Yahoo komt. */
export interface ParsedFundQuote {
  rows: FundQuoteRow[];
  lastNav: number | null;
  referenceNav: number | null;
  currency: string | null;
  /** Alleen gezet bij een response van de fund-quote Worker. */
  dataSource?: FundQuoteSource;
}

/** Response van de fund-quote Worker (Finnhub met Yahoo als terugval). */
export interface WorkerFundQuoteBody {
  source: FundQuoteSource;
  currency: string | null;
  rows: FundQuoteRow[];
  lastNav: number | null;
  referenceNav: number | null;
  error?: string;
}

/** Koersdata voor één fonds, zoals de context ze doorgeeft. */
export type FundQuoteState =
  | { status: 'loading' }
  | { status: 'ready'; chart: ParsedFundQuote }
  | { status: 'error'; message: string };

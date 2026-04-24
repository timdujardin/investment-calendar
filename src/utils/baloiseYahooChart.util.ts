export interface BaloiseChartRow {
  timeMs: number;
  nav: number;
}

export interface BaloiseParsedChart {
  rows: BaloiseChartRow[];
  lastNav: number | null;
  referenceNav: number | null;
  currency: string | null;
  /** Alleen gezet bij response van de fund-quote Worker. */
  dataSource?: 'finnhub' | 'yahoo';
}

/** Response van de fund-quote Worker (Finnhub/Yahoo). */
export interface WorkerFundQuoteBody {
  source: 'finnhub' | 'yahoo';
  currency: string | null;
  rows: BaloiseChartRow[];
  lastNav: number | null;
  referenceNav: number | null;
  error?: string;
}

interface YahooChartMeta {
  currency?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
}

interface YahooChartResult {
  timestamp?: number[];
  meta?: YahooChartMeta;
  indicators?: {
    quote?: Array<{
      close?: Array<number | null | undefined>;
    }>;
    adjclose?: Array<{ adjclose?: Array<number | null | undefined> }>;
  };
}

interface YahooChartEnvelope {
  chart?: {
    result?: YahooChartResult[];
    error?: { description?: string };
  };
}

export const buildYahooChartApiPath = (symbol: string, range: string, interval = '1d'): string => {
  const q = new URLSearchParams({ interval, range });

  return `/v8/finance/chart/${encodeURIComponent(symbol)}?${q}`;
};

const isWorkerFundQuoteBody = (raw: unknown): raw is WorkerFundQuoteBody => {
  if (typeof raw !== 'object' || raw === null) {
    return false;
  }

  const o = raw as Record<string, unknown>;

  return (o.source === 'finnhub' || o.source === 'yahoo') && Array.isArray(o.rows);
};

const quoteApiErrorMessage = (raw: unknown, status: number): string => {
  if (typeof raw === 'object' && raw !== null && 'error' in raw) {
    const e = (raw as { error: unknown }).error;
    if (typeof e === 'string') {
      return e;
    }
  }

  return `Quote API (${status})`;
};

/** Basis-URL van de Worker: trim, geen trailing slash, geen dubbele `/quote`. */
export const normalizeQuoteApiBase = (raw: string | undefined): string | undefined => {
  if (raw == null || typeof raw !== 'string') {
    return undefined;
  }

  let b = raw.trim();
  if (b.length === 0) {
    return undefined;
  }

  b = b.replace(/\/$/, '');
  if (b.endsWith('/quote')) {
    b = b.slice(0, -'/quote'.length).replace(/\/$/, '');
  }

  return b.length > 0 ? b : undefined;
};

/**
 * Haalt koersdata op: productie via Worker (`VITE_QUOTE_API_URL`), lokaal anders Yahoo via Vite-proxy.
 */
export async function fetchFundChartJson(symbol: string, range: string, signal?: AbortSignal): Promise<unknown> {
  const base = normalizeQuoteApiBase(import.meta.env.VITE_QUOTE_API_URL);

  if (base) {
    const url = `${base}/quote?${new URLSearchParams({ symbol, range })}`;
    const res = await fetch(url, { signal, cache: 'no-store' });
    const raw: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(quoteApiErrorMessage(raw, res.status));
    }

    return raw;
  }

  if (import.meta.env.DEV) {
    const path = buildYahooChartApiPath(symbol, range);
    const res = await fetch(`/yahoo-finance-api${path}`, { signal });

    if (!res.ok) {
      throw new Error(`Yahoo Finance (${res.status})`);
    }

    return res.json();
  }

  throw new Error('VITE_QUOTE_API_URL ontbreekt. Deploy de Worker en zet de URL in .env — zie README.');
}

export const parseFundQuoteResponse = (raw: unknown): BaloiseParsedChart => {
  if (isWorkerFundQuoteBody(raw)) {
    if (typeof raw.error === 'string' && raw.error.length > 0) {
      throw new Error(raw.error);
    }

    return {
      rows: raw.rows,
      lastNav: raw.lastNav,
      referenceNav: raw.referenceNav,
      currency: raw.currency,
      dataSource: raw.source,
    };
  }

  return parseYahooChartEnvelope(raw);
};

const pickReferenceNav = (meta: YahooChartMeta | undefined, rows: BaloiseChartRow[]): number | null => {
  const fromMeta = meta?.chartPreviousClose ?? meta?.previousClose;
  if (typeof fromMeta === 'number' && !Number.isNaN(fromMeta)) {
    return fromMeta;
  }
  if (rows.length >= 2) {
    return rows[rows.length - 2].nav;
  }

  return null;
};

const pickYahooBarClose = (rawClose: number | null | undefined, rawAdj: number | null | undefined): number | null => {
  if (typeof rawClose === 'number' && !Number.isNaN(rawClose)) {
    return rawClose;
  }

  if (typeof rawAdj === 'number' && !Number.isNaN(rawAdj)) {
    return rawAdj;
  }

  return null;
};

const yahooRowsFromResult = (result: YahooChartResult): BaloiseChartRow[] => {
  const ts = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  const closes = quote?.close ?? [];
  const adj = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const rows: BaloiseChartRow[] = [];

  for (let i = 0; i < ts.length; i++) {
    const v = pickYahooBarClose(closes[i], adj[i]);

    if (v != null) {
      const t = ts[i];
      if (typeof t === 'number') {
        rows.push({ timeMs: t * 1000, nav: v });
      }
    }
  }
  return rows;
};

export const parseYahooChartEnvelope = (raw: unknown): BaloiseParsedChart => {
  const env = raw as YahooChartEnvelope;
  const err = env.chart?.error?.description;
  if (err) {
    throw new Error(err);
  }

  const result = env.chart?.result?.[0];
  if (!result) {
    return { rows: [], lastNav: null, referenceNav: null, currency: null, dataSource: 'yahoo' };
  }

  const rows = yahooRowsFromResult(result);

  const lastRowNav = rows.length > 0 ? rows[rows.length - 1].nav : null;
  const metaPrice = result.meta?.regularMarketPrice;
  const lastNav = typeof metaPrice === 'number' && !Number.isNaN(metaPrice) ? metaPrice : lastRowNav;

  return {
    rows,
    lastNav,
    referenceNav: pickReferenceNav(result.meta, rows),
    currency: result.meta?.currency ?? null,
    dataSource: 'yahoo',
  };
};

/**
 * Edge proxy: Finnhub (stabiel) → Yahoo fallback.
 * Genormaliseerde JSON voor de PWA (geen API-keys in de browser).
 */

interface Env {
  FINNHUB_API_KEY?: string;
}

export interface FundQuoteRow {
  timeMs: number;
  nav: number;
}

export interface FundQuoteBody {
  source: 'finnhub' | 'yahoo';
  currency: string | null;
  rows: FundQuoteRow[];
  lastNav: number | null;
  referenceNav: number | null;
}

interface FinnhubCandle {
  c?: number[];
  t?: number[];
  s?: string;
}

interface YahooResult {
  timestamp?: number[];
  meta?: {
    currency?: string;
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
  };
  indicators?: {
    quote?: Array<{
      close?: Array<number | null | undefined>;
    }>;
    adjclose?: Array<{ adjclose?: Array<number | null | undefined> }>;
  };
}

interface YahooEnvelope {
  chart?: {
    result?: YahooResult[];
    error?: { description?: string };
  };
}

const CACHE_HEADER = 'public, max-age=0, s-maxage=300';

const cors = (): HeadersInit => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

const jsonWithCors = (data: unknown, status = 200): Response => {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_HEADER,
    ...cors(),
  });
  return new Response(JSON.stringify(data), { status, headers });
};

function rangeToFromToSec(range: string): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000);
  const d = 86400;

  switch (range) {
    case '1d':
      return { from: to - d, to };
    case '5d':
      return { from: to - 5 * d, to };
    case '1mo':
      return { from: to - 30 * d, to };
    case '3mo':
      return { from: to - 90 * d, to };
    case '6mo':
      return { from: to - 182 * d, to };
    case '2y':
      return { from: to - 730 * d, to };
    case '5y':
      return { from: to - 1825 * d, to };
    case '10y':
      return { from: to - 3650 * d, to };
    case 'ytd': {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: Math.floor(start.getTime() / 1000), to };
    }
    case 'max':
      return { from: to - 3650 * d, to };
    case '1y':
    default:
      return { from: to - 365 * d, to };
  }
}

function pickReferenceNav(meta: YahooResult['meta'] | undefined, rows: FundQuoteRow[]): number | null {
  const fromMeta = meta?.chartPreviousClose ?? meta?.previousClose;
  if (typeof fromMeta === 'number' && !Number.isNaN(fromMeta)) {
    return fromMeta;
  }
  if (rows.length >= 2) {
    return rows[rows.length - 2].nav;
  }
  return null;
}

function yahooRowsFromResult(result: YahooResult): FundQuoteRow[] {
  const ts = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  const closes = quote?.close ?? [];
  const adj = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const rows: FundQuoteRow[] = [];

  for (let i = 0; i < ts.length; i++) {
    const rawClose = closes[i];
    const rawAdj = adj[i];
    const v =
      typeof rawClose === 'number' && !Number.isNaN(rawClose)
        ? rawClose
        : typeof rawAdj === 'number' && !Number.isNaN(rawAdj)
          ? rawAdj
          : null;
    if (v != null) {
      const t = ts[i];
      if (typeof t === 'number') {
        rows.push({ timeMs: t * 1000, nav: v });
      }
    }
  }
  return rows;
}

async function fetchYahooFundQuote(symbol: string, range: string): Promise<FundQuoteBody> {
  const interval = '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json,text/plain,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo HTTP ${res.status}`);
  }

  let raw: YahooEnvelope;
  try {
    raw = (await res.json()) as YahooEnvelope;
  } catch {
    throw new Error('Yahoo gaf geen geldige JSON');
  }
  const err = raw.chart?.error?.description;
  if (err) {
    throw new Error(err);
  }

  const result = raw.chart?.result?.[0];
  if (!result) {
    return { source: 'yahoo', currency: null, rows: [], lastNav: null, referenceNav: null };
  }

  const rows = yahooRowsFromResult(result);
  const lastRowNav = rows.length > 0 ? rows[rows.length - 1].nav : null;
  const metaPrice = result.meta?.regularMarketPrice;
  const lastNav = typeof metaPrice === 'number' && !Number.isNaN(metaPrice) ? metaPrice : lastRowNav;

  return {
    source: 'yahoo',
    currency: result.meta?.currency ?? null,
    rows,
    lastNav,
    referenceNav: pickReferenceNav(result.meta, rows),
  };
}

async function fetchFinnhubFundQuote(symbol: string, range: string, token: string): Promise<FundQuoteBody | null> {
  const { from, to } = rangeToFromToSec(range);
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as FinnhubCandle;
  if (data.s !== 'ok' || !data.c?.length || !data.t?.length) {
    return null;
  }

  const rows: FundQuoteRow[] = [];
  for (let i = 0; i < data.t.length; i++) {
    const nav = data.c[i];
    const t = data.t[i];
    if (typeof nav === 'number' && !Number.isNaN(nav) && typeof t === 'number') {
      rows.push({ timeMs: t * 1000, nav });
    }
  }

  if (rows.length === 0) {
    return null;
  }

  const lastNav = rows[rows.length - 1].nav;
  const referenceNav = rows.length >= 2 ? rows[rows.length - 2].nav : null;

  return {
    source: 'finnhub',
    currency: 'EUR',
    rows,
    lastNav,
    referenceNav,
  };
}

function extractIsinFromSymbol(symbol: string): string | null {
  const base = symbol.includes('.') ? (symbol.split('.')[0] ?? '') : symbol;
  if (/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/i.test(base)) {
    return base.toUpperCase();
  }
  return null;
}

async function finnhubResolveTradingSymbol(isin: string, token: string): Promise<string | null> {
  const profileUrl = `https://finnhub.io/api/v1/stock/profile2?isin=${encodeURIComponent(isin)}&token=${encodeURIComponent(token)}`;
  const pr = await fetch(profileUrl);
  if (pr.ok) {
    const pj = (await pr.json()) as { ticker?: string };
    if (typeof pj.ticker === 'string' && pj.ticker.length > 0) {
      return pj.ticker;
    }
  }

  const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(isin)}&token=${encodeURIComponent(token)}`;
  const sr = await fetch(searchUrl);
  if (!sr.ok) {
    return null;
  }
  const sj = (await sr.json()) as { result?: Array<{ symbol?: string }> };
  const sym = sj.result?.[0]?.symbol;
  return typeof sym === 'string' && sym.length > 0 ? sym : null;
}

async function fetchFinnhubFundQuoteWithResolve(
  symbol: string,
  range: string,
  token: string,
): Promise<FundQuoteBody | null> {
  const direct = await fetchFinnhubFundQuote(symbol, range, token);
  if (direct && direct.rows.length > 0) {
    return direct;
  }

  const isin = extractIsinFromSymbol(symbol);
  if (!isin) {
    return null;
  }

  const resolved = await finnhubResolveTradingSymbol(isin, token);
  if (!resolved || resolved.toUpperCase() === symbol.toUpperCase()) {
    return null;
  }

  return fetchFinnhubFundQuote(resolved, range, token);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    if (request.method !== 'GET') {
      return jsonWithCors({ error: 'Method not allowed' }, 405);
    }

    const u = new URL(request.url);
    if (u.pathname !== '/quote' && u.pathname !== '/') {
      return jsonWithCors({ error: 'Gebruik GET /quote?symbol=…&range=1y' }, 404);
    }

    const symbol = u.searchParams.get('symbol')?.trim();
    const range = u.searchParams.get('range')?.trim() || '1y';

    if (!symbol) {
      return jsonWithCors({ error: 'Query-parameter symbol is verplicht' }, 400);
    }

    try {
      const token = env.FINNHUB_API_KEY?.trim();
      if (token) {
        const finnhub = await fetchFinnhubFundQuoteWithResolve(symbol, range, token);
        if (finnhub && finnhub.rows.length > 0) {
          return jsonWithCors(finnhub);
        }
      }

      const yahoo = await fetchYahooFundQuote(symbol, range);
      return jsonWithCors(yahoo);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Onbekende fout';
      return jsonWithCors({ error: message }, 502);
    }
  },
};

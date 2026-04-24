/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Basis-URL van de Cloudflare Worker (zonder slash), bv. https://investment-calendar-fund-quote.xxx.workers.dev */
  readonly VITE_QUOTE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

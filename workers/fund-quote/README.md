# Fund quote Worker (Cloudflare)

Serverless endpoint voor de PWA: **Finnhub** (dagelijkse candles) met **Yahoo** als fallback. Geen API-keys in de browser.

## Setup

1. [Cloudflare account](https://dash.cloudflare.com/) → Workers & Pages → Create Worker (of gebruik Wrangler CLI).
2. In deze map:

   ```bash
   cd workers/fund-quote
   npm install
   npx wrangler login
   npx wrangler secret put FINNHUB_API_KEY
   ```

   Plak je [Finnhub](https://finnhub.io/) API key (gratis tier volstaat voor persoonlijk gebruik).

3. Deploy:

   ```bash
   npm run deploy
   ```

4. Noteer de Worker-URL (bv. `https://investment-calendar-fund-quote.<subdomain>.workers.dev`).

## API

- `GET /quote?symbol=FR0011253624.PA&range=1y`
- `range`: zelfde conventie als Yahoo waar mogelijk (`1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`).

Response (JSON):

```json
{
  "source": "finnhub",
  "currency": "EUR",
  "rows": [{ "timeMs": 1700000000000, "nav": 1234.56 }],
  "lastNav": 1234.56,
  "referenceNav": 1230.0
}
```

`source` is `yahoo` als Finnhub geen data teruggeeft of als `FINNHUB_API_KEY` ontbreekt (dan alleen Yahoo).

## Lokale dev

```bash
npm run dev
```

Zet `FINNHUB_API_KEY` in `.dev.vars` (niet committen):

```
FINNHUB_API_KEY=jouw_key
```

Wrangler laadt `.dev.vars` automatisch tijdens `wrangler dev`.

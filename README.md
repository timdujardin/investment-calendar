# Investment calendar

Investment and pension savings overview dashboard (2026–2054). PWA-ready for installation on smartphone.

## PWA Installation

Deploy the app over **HTTPS** (required for PWA). On your smartphone:

- **Android (Chrome)**: Open the app URL → menu (⋮) → "Install app" or "Add to Home screen"
- **iOS (Safari)**: Open the app URL → Share → "Add to Home Screen"

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

Icons are auto-generated from `public/favicon.svg` before each build. To regenerate manually: `npm run pwa:icons`.

## Fondskoers (live) — Cloudflare Worker

De pensioenpagina haalt koersdata op via een **eigen Worker**, niet rechtstreeks vanuit de browser (CORS / betrouwbaarheid).

1. Deploy de Worker: zie [`workers/fund-quote/README.md`](workers/fund-quote/README.md).
2. Maak een `.env` in de projectroot (of gebruik je CI-secrets) met:

   ```bash
   VITE_QUOTE_API_URL=https://jouw-worker.workers.dev
   ```

   Gebruik de basis-URL **zonder** slash op het einde.

3. `npm run build` — de URL wordt in de frontend ingebakken.

**Lokaal zonder Worker:** `npm run dev` gebruikt de Vite-proxy naar Yahoo. Zonder `VITE_QUOTE_API_URL` faalt een productiebuild bewust met een duidelijke fout (zet de Worker-URL voor je deploy).

Finnhub API-key staat **alleen** als `wrangler secret put FINNHUB_API_KEY`, nooit in git.

**GitHub Pages:** voeg in het repository onder Settings → Secrets and variables → Actions een secret **`VITE_QUOTE_API_URL`** toe met je Worker-basis-URL. De workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) geeft die door aan `npm run build`.

### Geen fondskoers op de pensioenpagina?

1. **GitHub Pages:** bestaat het secret **`VITE_QUOTE_API_URL`** echt, en heb je **ná** het toevoegen opnieuw gedeployed? De URL wordt bij **build** ingevrozen; alleen `.env` lokaal helpt de live site niet.
2. **Juiste URL:** gebruik de basis van de Worker, bv. `https://investment-calendar-fund-quote.jouw-subdomein.workers.dev` — **zonder** `/quote` aan het einde (de app plakt `/quote` zelf).
3. **Worker:** opnieuw deployen na `wrangler secret put FINNHUB_API_KEY`. Test in de browser:  
   `https://jouw-worker…/quote?symbol=FR0011253624.PA&range=1y` — je zou JSON met `rows` moeten zien.
4. **Lokaal:** na wijziging van `.env` even `npm run dev` herstarten.

**UCITS / bepaalde fondsen:** Yahoo’s chart-API geeft soms **geen historische dagelijkse punten** (wel `regularMarketPrice` in metadata). De app toont dan een **snapshot** (laatste koers + % vs. vorig slot) i.p.v. een lijngrafiek — dat is een beperking van de databron, geen fout in je Worker.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactDom from 'eslint-plugin-react-dom';
import reactX from 'eslint-plugin-react-x';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

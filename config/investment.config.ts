import type { InvestmentPosition, MonthlyInvestmentPlan } from '@/@types/investment';

export const TARGET_AT_40 = 100_000;
export const BIRTH_YEAR = 1994;
export const TARGET_AGE = 40;

export const START_YEAR = 2026;
export const END_YEAR = 2054;

export const INVESTMENT_POSITIONS: InvestmentPosition[] = [
  {
    name: 'Tourmaline Oil Corp',
    ticker: 'TOU.TO',
    amount: 10_000,
    shares: 250,
    dividendPerShare: 0.5,
    dividendFrequencyPerYear: 4,
    dividendReceived: 40,
  },
  { name: 'Ivanhoe Mines Ltd', ticker: 'IVN.TO', amount: 6_000, shares: 850 },
];

export const MONTHLY_INVESTMENT_PLANS: MonthlyInvestmentPlan[] = [
  {
    name: 'Amundi Funds China Equity A EUR Cap',
    isin: 'LU1882445569',
    monthlyAmount: 250,
    entryFeeRate: 0.025,
    exitFees: [
      { afterYears: 1, rate: 0.0618 },
      { afterYears: 3, rate: 0.0363 },
      { afterYears: 5, rate: 0.0312 },
    ],
    minimumHorizonYears: 10,
  },
  {
    name: 'Amundi Funds Global Equity A EUR (C)',
    isin: 'LU1883342377',
    monthlyAmount: 250,
    entryFeeRate: 0.025,
    exitFees: [
      { afterYears: 1, rate: 0.0664 },
      { afterYears: 3, rate: 0.0409 },
      { afterYears: 5, rate: 0.0359 },
    ],
    minimumHorizonYears: 10,
  },
];

export const CASH_RESERVE = 8_500;
export const INVESTMENT_FIRST_YEAR_MONTHS = 10; // mrt–dec
export const INVESTMENT_MONTHLY = 500;

export const CRELAN_PENSION_FUND_NAME = 'BNP Paribas B Pension Balanced Classic Cap';
export const CRELAN_PENSION_ISIN = 'BE0026480963';
export const CRELAN_RATE = 0.0261;
export const CRELAN_START_VALUE = 7_646.63;

export const BALOISE_FUND_NAME = 'R-co Valor';
export const BALOISE_ISIN = 'FR0011253624';
export const BALOISE_RATE = 0.075;

/** Kalenderdag waarop de premie op de Baloise-rekening staat. */
export const BALOISE_DEPOSIT_DAY_OF_MONTH = 13;

/**
 * Yahoo Finance-symbool voor live NAV + historiek.
 * Voor R-co Valor C EUR geeft de Euronext Paris quote (`FR0011253624.PA`) alleen metadata
 * terug; de **Frankfurt/Xetra mutual-fund quote** `0P00017T6E.F` bevat wél een dagelijkse
 * tijdreeks die de chart-API kan serveren.
 */
export const BALOISE_YAHOO_CHART_SYMBOL = '0P00017T6E.F';

export const BALOISE_YAHOO_QUOTE_URL = `https://finance.yahoo.com/quote/${encodeURIComponent(BALOISE_YAHOO_CHART_SYMBOL)}`;

export const BALOISE_YAHOO_CHART_RANGE = '1y';

export const BALOISE_POLICY_NUMBER = '1C67741';

/** Poliseinde (lokale kalenderdag). */
export const BALOISE_CONTRACT_END_ISO = '2059-07-13';

/** Reeds op de rekening vóór de eerste automatische incasso in 2026 (2 × €105). */
export const BALOISE_OPENING_INVESTED_EUR = 210;

export interface BaloiseManualDeposit {
  /** Lokale kalenderdag `YYYY-MM-DD` waarop de premie op de Baloise-rekening stond. */
  dateIso: string;
  /** Bedrag in euro. */
  amount: number;
}

/**
 * Premies die manueel (vóór automatische incasso) gestort zijn.
 * Gebruikt om units te berekenen uit de NAV-op-stortingsdatum voor de live P&L.
 * Pas de data aan als je stortingen op andere dagen gebeurden.
 */
export const BALOISE_INITIAL_DEPOSITS: readonly BaloiseManualDeposit[] = [
  { dateIso: '2026-03-13', amount: 105 },
  { dateIso: '2026-04-13', amount: 105 },
];

/** Eerste automatische incasso €105 in 2026 (13 mei). */
export const BALOISE_FIRST_AUTO_DATE_ISO = '2026-05-13';

const baloiseFirstAutoMonth = Number(BALOISE_FIRST_AUTO_DATE_ISO.split('-')[1]);

/** Aantal automatische stortingen €105 in 2026 (mei t/m dec). */
export const BALOISE_AUTO_PAYMENT_COUNT_2026 =
  Number.isNaN(baloiseFirstAutoMonth) ? 0 : 12 - baloiseFirstAutoMonth + 1;

export const BALOISE_MONTHLY_2026 = 105;
export const BALOISE_MONTHLY_FROM_2027 = 87.5;
export const BALOISE_ANNUAL_CONTRIBUTION = BALOISE_MONTHLY_FROM_2027 * 12;

/** Totaal ingelegd eind 2026: openingsaldo + automatische incasso's. */
export const BALOISE_FIRST_YEAR_INVESTED_TOTAL =
  BALOISE_OPENING_INVESTED_EUR + BALOISE_AUTO_PAYMENT_COUNT_2026 * BALOISE_MONTHLY_2026;

export const CAD_TO_EUR = 0.67;

export const PENSION_RECAPTURE_RATE = 0.08;
export const INVESTMENT_TRANSACTION_FEE_RATE = 0.07;
export const CAPITAL_GAINS_TAX_RATE = 0.1;
export const CAPITAL_GAINS_TAX_THRESHOLD = 10_000;

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

export const BALOISE_MONTHLY_2026 = 105;
export const BALOISE_MONTHLY_FROM_2027 = 87.5;
export const BALOISE_ANNUAL_CONTRIBUTION = BALOISE_MONTHLY_FROM_2027 * 12;
export const BALOISE_FIRST_YEAR_TOTAL = BALOISE_MONTHLY_2026 * 10; // mrt–dec 2026

export const CAD_TO_EUR = 0.67;

export const PENSION_RECAPTURE_RATE = 0.08;
export const INVESTMENT_TRANSACTION_FEE_RATE = 0.07;
export const CAPITAL_GAINS_TAX_RATE = 0.1;
export const CAPITAL_GAINS_TAX_THRESHOLD = 10_000;

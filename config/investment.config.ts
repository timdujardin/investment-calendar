export const TARGET_AT_40 = 100_000;
export const BIRTH_YEAR = 1994;
export const TARGET_AGE = 40;

export const START_YEAR = 2026;
export const END_YEAR = 2054;
export const PROJECTION_YEARS = END_YEAR - START_YEAR;
export const ROW_INDEX_AT_40 = TARGET_AGE - (START_YEAR - BIRTH_YEAR);

export const INVESTMENT_MONTHLY_2026 = 500;
export const INVESTMENT_MONTHLY_FROM_2027 = 600;

export const CRELAN_RATE = 0.05;
export const BALOISE_RATE = 0.075;
export const CRELAN_START_VALUE = 7_969.21;

export const BALOISE_MONTHLY_2026 = 105;
export const BALOISE_MONTHLY_FROM_2027 = 87.5;
export const BALOISE_ANNUAL_CONTRIBUTION = BALOISE_MONTHLY_FROM_2027 * 12; // €1050/year
export const BALOISE_FIRST_YEAR_MONTHS = 10; // mrt–dec 2026
export const BALOISE_FIRST_YEAR_TOTAL = BALOISE_MONTHLY_2026 * BALOISE_FIRST_YEAR_MONTHS;

export const INVESTMENT_YEARS: readonly (string | number)[] = [
  '2026 (apr–dec)',
  ...Array.from({ length: PROJECTION_YEARS }, (_, i) => START_YEAR + 1 + i),
];

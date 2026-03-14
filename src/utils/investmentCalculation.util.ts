import type { InvestmentYearRow, PensionYearRow, CombinedYearRow } from '../types/investment';
import type { InvestmentRate } from '../types/investment';
import {
  CRELAN_START_VALUE,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  BALOISE_ANNUAL_CONTRIBUTION,
  BALOISE_FIRST_YEAR_TOTAL,
  INVESTMENT_MONTHLY_2026,
  INVESTMENT_MONTHLY_FROM_2027,
  BIRTH_YEAR,
  PROJECTION_YEARS,
} from '../../config/investment.config';

const FIRST_YEAR_MONTHS = 9;

export interface PensionRates {
  crelanRate: number;
  baloiseRate: number;
}

export function calculatePensionData(rates: PensionRates): PensionYearRow[] {
  const rCrelan = 1 + rates.crelanRate;
  const rBaloise = 1 + rates.baloiseRate;
  const result: PensionYearRow[] = [];
  let valueCrelan = CRELAN_START_VALUE * Math.pow(rCrelan, FIRST_YEAR_MONTHS / 12);
  let valueBaloise =
    BALOISE_MONTHLY_2026 * Math.pow(rBaloise, FIRST_YEAR_MONTHS / 12) +
    (BALOISE_FIRST_YEAR_TOTAL - BALOISE_MONTHLY_2026) * Math.pow(rBaloise, 4.5 / 12);
  let investedCrelan = CRELAN_START_VALUE;
  let investedBaloise = BALOISE_FIRST_YEAR_TOTAL;

  result.push({
    investedTotal: investedCrelan + investedBaloise,
    valueTotal: valueCrelan + valueBaloise,
    investedCrelan,
    investedBaloise,
    valueCrelan,
    valueBaloise,
  });

  for (let y = 1; y <= PROJECTION_YEARS; y++) {
    valueCrelan *= rCrelan;
    valueBaloise = valueBaloise * rBaloise + BALOISE_ANNUAL_CONTRIBUTION * Math.pow(rBaloise, 0.5);
    investedBaloise += BALOISE_ANNUAL_CONTRIBUTION;
    result.push({
      investedTotal: investedCrelan + investedBaloise,
      valueTotal: valueCrelan + valueBaloise,
      investedCrelan,
      investedBaloise,
      valueCrelan,
      valueBaloise,
    });
  }
  return result;
}

interface RawInvestmentRow {
  j: string | number;
  ii: number;
  vi5: number;
  vi7: number;
  vi10: number;
  wi5: number;
  wi7: number;
  wi10: number;
}

const INVESTMENT_RAW: RawInvestmentRow[] = [
  { j: '2026 (apr–dec)', ii: 24500, vi5: 25245.41, vi7: 25541.07, vi10: 25981.99, wi5: 745.41, wi7: 1041.07, wi10: 1481.99 },
  { j: 2027, ii: 33200, vi5: 35550, vi7: 36518, vi10: 38000, wi5: 2350, wi7: 3318, wi10: 4800 },
  { j: 2028, ii: 40400, vi5: 44527.5, vi7: 46274.26, vi10: 49000, wi5: 4127.5, wi7: 5874.26, wi10: 8600 },
  { j: 2029, ii: 47600, vi5: 53953.88, vi7: 56713.46, vi10: 61100, wi5: 6353.88, wi7: 9113.46, wi10: 13500 },
  { j: 2030, ii: 54800, vi5: 63851.57, vi7: 67883.4, vi10: 74410, wi5: 9051.57, wi7: 13083.4, wi10: 19610 },
  { j: 2031, ii: 62000, vi5: 74244.15, vi7: 79835.24, vi10: 89051, wi5: 12244.15, wi7: 17835.24, wi10: 27051 },
  { j: 2032, ii: 69200, vi5: 85156.35, vi7: 92623.7, vi10: 105156.1, wi5: 15956.35, wi7: 23423.7, wi10: 35956.1 },
  { j: 2033, ii: 76400, vi5: 96614.17, vi7: 106307.36, vi10: 122871.71, wi5: 20214.17, wi7: 29907.36, wi10: 46471.71 },
  { j: 2034, ii: 83600, vi5: 108644.88, vi7: 120948.88, vi10: 142358.88, wi5: 25044.88, wi7: 37348.88, wi10: 58758.88 },
  { j: 2035, ii: 90800, vi5: 121277.12, vi7: 136615.3, vi10: 163794.77, wi5: 30477.12, wi7: 45815.3, wi10: 72994.77 },
  { j: 2036, ii: 98000, vi5: 134540.98, vi7: 153378.37, vi10: 187374.25, wi5: 36540.98, wi7: 55378.37, wi10: 89374.25 },
  { j: 2037, ii: 105200, vi5: 148468.03, vi7: 171314.86, vi10: 213311.67, wi5: 43268.03, wi7: 66114.86, wi10: 108111.67 },
  { j: 2038, ii: 112400, vi5: 163091.43, vi7: 190506.9, vi10: 241842.84, wi5: 50691.43, wi7: 78106.9, wi10: 129442.84 },
  { j: 2039, ii: 119600, vi5: 178446, vi7: 211042.38, vi10: 273227.12, wi5: 58846, wi7: 91442.38, wi10: 153627.12 },
  { j: 2040, ii: 126800, vi5: 194568.3, vi7: 233015.35, vi10: 307749.83, wi5: 67768.3, wi7: 106215.35, wi10: 180949.83 },
  { j: 2041, ii: 134000, vi5: 211496.72, vi7: 256526.42, vi10: 345724.82, wi5: 77496.72, wi7: 122526.42, wi10: 211724.82 },
  { j: 2042, ii: 141200, vi5: 229271.55, vi7: 281683.27, vi10: 387497.3, wi5: 88071.55, wi7: 140483.27, wi10: 246297.3 },
  { j: 2043, ii: 148400, vi5: 247935.13, vi7: 308601.1, vi10: 433447.03, wi5: 99535.13, wi7: 160201.1, wi10: 285047.03 },
  { j: 2044, ii: 155600, vi5: 267531.89, vi7: 337403.18, vi10: 483991.73, wi5: 111931.89, wi7: 181803.18, wi10: 328391.73 },
  { j: 2045, ii: 162800, vi5: 288108.48, vi7: 368221.4, vi10: 539590.9, wi5: 125308.48, wi7: 205421.4, wi10: 376790.9 },
  { j: 2046, ii: 170000, vi5: 309713.91, vi7: 401196.9, vi10: 600749.99, wi5: 139713.91, wi7: 231196.9, wi10: 430749.99 },
  { j: 2047, ii: 177200, vi5: 332399.6, vi7: 436480.68, vi10: 668024.99, wi5: 155199.6, wi7: 259280.68, wi10: 490824.99 },
  { j: 2048, ii: 184400, vi5: 356219.58, vi7: 474234.33, vi10: 742027.49, wi5: 171819.58, wi7: 289834.33, wi10: 557627.49 },
  { j: 2049, ii: 191600, vi5: 381230.56, vi7: 514630.73, vi10: 823430.24, wi5: 189630.56, wi7: 323030.73, wi10: 631830.24 },
  { j: 2050, ii: 198800, vi5: 407492.09, vi7: 557854.88, vi10: 912973.27, wi5: 208692.09, wi7: 359054.88, wi10: 714173.27 },
  { j: 2051, ii: 206000, vi5: 435066.69, vi7: 604104.73, vi10: 1011470.59, wi5: 229066.69, wi7: 398104.73, wi10: 805470.59 },
  { j: 2052, ii: 213200, vi5: 464020.03, vi7: 653592.06, vi10: 1119817.65, wi5: 250820.03, wi7: 440392.06, wi10: 906617.65 },
  { j: 2053, ii: 220400, vi5: 494421.03, vi7: 706543.5, vi10: 1238999.42, wi5: 274021.03, wi7: 486143.5, wi10: 1018599.42 },
  { j: 2054, ii: 227600, vi5: 526342.08, vi7: 763201.55, vi10: 1370099.36, wi5: 298742.08, wi7: 535601.55, wi10: 1142499.36 },
];

const INVESTMENT_BASE: InvestmentYearRow[] = INVESTMENT_RAW.map((row) => ({
  year: row.j,
  investedAmount: row.ii,
  valueAt5: row.vi5,
  valueAt7: row.vi7,
  valueAt10: row.vi10,
  interestAt5: row.wi5,
  interestAt7: row.wi7,
  interestAt10: row.wi10,
}));

function getValueKey(rate: InvestmentRate): keyof InvestmentYearRow {
  return rate === 5 ? 'valueAt5' : rate === 7 ? 'valueAt7' : 'valueAt10';
}

function getInterestKey(rate: InvestmentRate): keyof InvestmentYearRow {
  return rate === 5 ? 'interestAt5' : rate === 7 ? 'interestAt7' : 'interestAt10';
}

export function buildCombinedData(rate: InvestmentRate, pensionRates: PensionRates): CombinedYearRow[] {
  const pensionData = calculatePensionData(pensionRates);
  const valueKey = getValueKey(rate);
  const interestKey = getInterestKey(rate);

  return INVESTMENT_BASE.map((row, i) => {
    const pension = pensionData[i];
    const investmentValue = row[valueKey] as number;
    const investmentInterest = row[interestKey] as number;
    const totalValue = investmentValue + pension.valueTotal;
    const profitPercent =
      Math.round(1000 * (totalValue - row.investedAmount - pension.investedTotal) / (row.investedAmount + pension.investedTotal)) / 10;
    const year = row.year;
    const age = typeof year === 'number' ? year - BIRTH_YEAR : 32;

    return {
      year: row.year,
      age,
      investmentInvested: row.investedAmount,
      investmentValue,
      investmentInterest,
      pensionInvested: pension.investedTotal,
      pensionValue: pension.valueTotal,
      totalValue,
      profitPercent,
      investmentMonthly: i === 0 ? INVESTMENT_MONTHLY_2026 : INVESTMENT_MONTHLY_FROM_2027,
      pensionMonthly: i === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027,
    };
  });
}

export function getLastRow<T>(data: T[]): T {
  return data[data.length - 1];
}

export function getAgeFromYear(year: string | number): number {
  return typeof year === 'number' ? year - BIRTH_YEAR : 32;
}

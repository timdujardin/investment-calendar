import type { PensionYearRow, CombinedYearRow } from '../types/investment';
import type { InvestmentRate } from '../types/investment';
import {
  CRELAN_START_VALUE,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  BALOISE_ANNUAL_CONTRIBUTION,
  BALOISE_FIRST_YEAR_TOTAL,
  BIRTH_YEAR,
  CAPITAL_GAINS_TAX_THRESHOLD,
} from '../../config/investment.config';

const FIRST_YEAR_MONTHS = 10;

export interface PensionRates {
  crelanRate: number;
  baloiseRate: number;
}

export function calculatePensionData(
  rates: PensionRates,
  projectionYears: number,
): PensionYearRow[] {
  const rCrelan = 1 + rates.crelanRate;
  const rBaloise = 1 + rates.baloiseRate;
  const result: PensionYearRow[] = [];
  const investedCrelan = CRELAN_START_VALUE;
  let investedBaloise = BALOISE_FIRST_YEAR_TOTAL;

  result.push({
    investedTotal: investedCrelan,
    valueTotal: CRELAN_START_VALUE,
    investedCrelan,
    investedBaloise: 0,
    valueCrelan: CRELAN_START_VALUE,
    valueBaloise: 0,
  });

  let valueCrelan = CRELAN_START_VALUE * Math.pow(rCrelan, FIRST_YEAR_MONTHS / 12);
  let valueBaloise =
    BALOISE_MONTHLY_2026 * Math.pow(rBaloise, FIRST_YEAR_MONTHS / 12) +
    (BALOISE_FIRST_YEAR_TOTAL - BALOISE_MONTHLY_2026) * Math.pow(rBaloise, 4.5 / 12);

  result.push({
    investedTotal: investedCrelan + investedBaloise,
    valueTotal: valueCrelan + valueBaloise,
    investedCrelan,
    investedBaloise,
    valueCrelan,
    valueBaloise,
  });

  for (let y = 1; y <= projectionYears; y++) {
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

export type SavingsData = Record<string, Record<number, number | null>>;

export interface BuildCombinedDataParams {
  rate: InvestmentRate;
  pensionRates: PensionRates;
  cashReserve: number;
  startingValue: number;
  projectionYears: number;
  firstYearMonths: number;
  monthlyFirstYear: number;
  monthlyAfterFirstYear: number;
  savingsData: SavingsData;
  startYear: number;
  investmentYears: readonly (string | number)[];
  pensionRecaptureRate: number;
  transactionFeeRate: number;
  capitalGainsTaxRate: number;
}

function getMonthlyDeposit(
  yearSaved: Record<number, number | null> | undefined,
  monthIndex: number,
  fallback: number,
): number {
  const saved = yearSaved?.[monthIndex];
  return saved ?? fallback;
}

function calculateInvestmentData(params: BuildCombinedDataParams) {
  const monthlyRate = params.rate / 100 / 12;
  const result: { invested: number; value: number; interest: number }[] = [];

  let value = params.startingValue;
  let invested = params.startingValue;

  result.push({ invested, value, interest: 0 });

  const startMonthIndex = 12 - params.firstYearMonths;
  const firstYearKey = String(params.startYear);
  const firstYearSaved = params.savingsData[firstYearKey];

  for (let m = startMonthIndex; m < 12; m++) {
    value *= 1 + monthlyRate;
    const deposit = getMonthlyDeposit(firstYearSaved, m, params.monthlyFirstYear);
    value += deposit;
    invested += deposit;
  }

  result.push({ invested, value, interest: value - invested });

  for (let y = 1; y <= params.projectionYears; y++) {
    const yearKey = String(params.startYear + y);
    const yearSaved = params.savingsData[yearKey];

    for (let m = 0; m < 12; m++) {
      value *= 1 + monthlyRate;
      const deposit = getMonthlyDeposit(yearSaved, m, params.monthlyAfterFirstYear);
      value += deposit;
      invested += deposit;
    }

    result.push({ invested, value, interest: value - invested });
  }

  return result;
}

export function buildCombinedData(params: BuildCombinedDataParams): CombinedYearRow[] {
  const pensionData = calculatePensionData(params.pensionRates, params.projectionYears);
  const investmentData = calculateInvestmentData(params);

  return investmentData.map((inv, i) => {
    const pension = pensionData[i];
    const year = params.investmentYears[i];
    const age = typeof year === 'number' ? year - BIRTH_YEAR : params.startYear - BIRTH_YEAR;
    const investmentPensionTotal = inv.value + pension.valueTotal;
    const totalInvested = inv.invested + pension.investedTotal;
    const profitPercent =
      totalInvested > 0
        ? Math.round(1000 * (investmentPensionTotal - totalInvested) / totalInvested) / 10
        : 0;

    const pensionRecapture = pension.valueTotal * params.pensionRecaptureRate;
    const pensionNetValue = pension.valueTotal - pensionRecapture;

    const investmentTransactionCosts = inv.invested * params.transactionFeeRate;
    const taxableProfit = Math.max(inv.interest, 0);
    const investmentCapitalGainsTax =
      Math.floor(taxableProfit / CAPITAL_GAINS_TAX_THRESHOLD) *
      CAPITAL_GAINS_TAX_THRESHOLD *
      params.capitalGainsTaxRate;
    const investmentNetValue =
      inv.value - investmentTransactionCosts - investmentCapitalGainsTax;

    const totalNetValue = investmentNetValue + pensionNetValue + params.cashReserve;

    return {
      year,
      age,
      investmentInvested: inv.invested,
      investmentValue: inv.value,
      investmentInterest: inv.interest,
      pensionInvested: pension.investedTotal,
      pensionValue: pension.valueTotal,
      cashReserve: params.cashReserve,
      totalValue: investmentPensionTotal + params.cashReserve,
      profitPercent,
      investmentMonthly: i <= 1 ? params.monthlyFirstYear : params.monthlyAfterFirstYear,
      pensionMonthly: i <= 1 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027,
      pensionRecapture,
      pensionNetValue,
      investmentTransactionCosts,
      investmentCapitalGainsTax,
      investmentNetValue,
      totalNetValue,
    };
  });
}

export function getLastRow<T>(data: T[]): T {
  return data[data.length - 1];
}

export function getAgeFromYear(year: string | number): number {
  return typeof year === 'number' ? year - BIRTH_YEAR : 32;
}

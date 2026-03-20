import {
  BALOISE_ANNUAL_CONTRIBUTION,
  BALOISE_FIRST_YEAR_TOTAL,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  BIRTH_YEAR,
  CAPITAL_GAINS_TAX_THRESHOLD,
  CRELAN_START_VALUE,
} from '@config/investment.config';
import type { CombinedYearRow, InvestmentRate, PensionYearRow } from '@/@types/investment';

const FIRST_YEAR_MONTHS = 10;

interface PensionRates {
  crelanRate: number;
  baloiseRate: number;
}

export const calculatePensionData = (rates: PensionRates, projectionYears: number): PensionYearRow[] => {
  const rCrelan = 1 + rates.crelanRate;
  const rBaloise = 1 + rates.baloiseRate;
  const result: PensionYearRow[] = [];
  const investedCrelan = CRELAN_START_VALUE;
  let investedBaloise = BALOISE_FIRST_YEAR_TOTAL;

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
};

type SavingsData = Record<string, Record<number, number | null>>;

interface BuildCombinedDataParams {
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
  investmentYears: readonly number[];
  pensionRecaptureRate: number;
  transactionFeeRate: number;
  capitalGainsTaxRate: number;
}

const getMonthlyDeposit = (
  yearSaved: Record<number, number | null> | undefined,
  monthIndex: number,
  fallback: number,
): number => {
  const saved = yearSaved?.[monthIndex];

  return saved ?? fallback;
};

const calculateInvestmentData = (params: BuildCombinedDataParams) => {
  const monthlyRate = params.rate / 100 / 12;
  const result: { invested: number; value: number; interest: number }[] = [];

  let value = params.startingValue;
  let invested = params.startingValue;

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
};

export const buildCombinedData = (params: BuildCombinedDataParams): CombinedYearRow[] => {
  const pensionData = calculatePensionData(params.pensionRates, params.projectionYears);
  const investmentData = calculateInvestmentData(params);

  return investmentData.map((inv, i) => {
    const pension = pensionData[i];
    const year = params.investmentYears[i];
    const age = year - BIRTH_YEAR;
    const investmentPensionTotal = inv.value + pension.valueTotal;
    const totalInvested = inv.invested + pension.investedTotal;
    const profitPercent =
      totalInvested > 0 ? Math.round((1000 * (investmentPensionTotal - totalInvested)) / totalInvested) / 10 : 0;

    const pensionRecapture = pension.valueTotal * params.pensionRecaptureRate;
    const pensionNetValue = pension.valueTotal - pensionRecapture;

    const investmentTransactionCosts = inv.invested * params.transactionFeeRate;
    const taxableProfit = Math.max(inv.interest, 0);
    const investmentCapitalGainsTax =
      Math.floor(taxableProfit / CAPITAL_GAINS_TAX_THRESHOLD) *
      CAPITAL_GAINS_TAX_THRESHOLD *
      params.capitalGainsTaxRate;
    const investmentNetValue = inv.value - investmentTransactionCosts - investmentCapitalGainsTax;

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
      investmentMonthly: i === 0 ? params.monthlyFirstYear : params.monthlyAfterFirstYear,
      pensionMonthly: i === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027,
      pensionRecapture,
      pensionNetValue,
      investmentTransactionCosts,
      investmentCapitalGainsTax,
      investmentNetValue,
      totalNetValue,
    };
  });
};

export const getLastRow = <T>(data: T[]): T => {
  return data[data.length - 1];
};

export const getAgeFromYear = (year: number): number => {
  return year - BIRTH_YEAR;
};

export const getTotalCosts = (row: CombinedYearRow): number => {
  return row.investmentTransactionCosts + row.investmentCapitalGainsTax + row.pensionRecapture;
};

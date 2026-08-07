import {
  BALOISE_ENTRY_COST_RATE,
  BALOISE_FIRST_PERIOD_MONTH_INDEX,
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  BIRTH_YEAR,
  CAPITAL_GAINS_TAX_THRESHOLD,
  INVESTMENT_FIRST_YEAR_MONTHS,
} from '@config/investment.config';
import type {
  CombinedYearRow,
  DividendPayout,
  ExitFeeSchedule,
  InvestmentPosition,
  InvestmentRate,
  MonthlyInvestmentPlan,
  PensionYearRow,
} from '@/@types/investment';

export interface PensionInputs {
  crelanRate: number;
  baloiseRate: number;
  /** Waarde van de Crelan-positie vandaag: eenheden maal de laatste koers. */
  crelanStartValue: number;
  /** Bruto gestort op Crelan; de stortingen zijn afgelopen, dus dit blijft constant. */
  crelanInvested: number;
}

const monthlyRateFromAnnual = (annual: number): number => Math.pow(1 + annual, 1 / 12) - 1;

export const calculatePensionData = (inputs: PensionInputs, projectionYears: number): PensionYearRow[] => {
  const rCrelan = 1 + inputs.crelanRate;
  const mRateBaloise = monthlyRateFromAnnual(inputs.baloiseRate);
  const result: PensionYearRow[] = [];
  const investedCrelan = inputs.crelanInvested;

  let valueCrelan = inputs.crelanStartValue * Math.pow(rCrelan, INVESTMENT_FIRST_YEAR_MONTHS / 12);

  // Slechts 98% van elke premie wordt belegd; de instapkost verdwijnt bij Baloise.
  // Zonder die correctie zou de prognose structureel te rooskleurig zijn.
  const baloiseInvestedShare = 1 - BALOISE_ENTRY_COST_RATE;

  let valueBaloise = 0;
  let investedBaloise = 0;

  for (let m = BALOISE_FIRST_PERIOD_MONTH_INDEX; m < 12; m++) {
    valueBaloise *= 1 + mRateBaloise;
    valueBaloise += BALOISE_MONTHLY_2026 * baloiseInvestedShare;
    investedBaloise += BALOISE_MONTHLY_2026;
  }

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
    for (let m = 0; m < 12; m++) {
      valueBaloise *= 1 + mRateBaloise;
      valueBaloise += BALOISE_MONTHLY_FROM_2027 * baloiseInvestedShare;
      investedBaloise += BALOISE_MONTHLY_FROM_2027;
    }
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

export interface BuildCombinedDataParams {
  rate: InvestmentRate;
  pensionInputs: PensionInputs;
  cashReserve: number;
  boleroCash: number;
  positionsTotal: number;
  monthlyPlans: MonthlyInvestmentPlan[];
  projectionYears: number;
  firstYearMonths: number;
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

const getExitFeeRate = (holdingYears: number, exitFees: ExitFeeSchedule[]): number => {
  let rate = exitFees[0]?.rate ?? 0;
  for (const fee of exitFees) {
    if (holdingYears >= fee.afterYears) {
      rate = fee.rate;
    }
  }
  return rate;
};

const getWeightedExitFeeRate = (holdingYears: number, plans: MonthlyInvestmentPlan[]): number => {
  const totalMonthly = plans.reduce((sum, p) => sum + p.monthlyAmount, 0);
  if (totalMonthly === 0) {
    return 0;
  }

  let weightedRate = 0;
  for (const plan of plans) {
    const weight = plan.monthlyAmount / totalMonthly;
    weightedRate += weight * getExitFeeRate(holdingYears, plan.exitFees);
  }
  return weightedRate;
};

interface StreamRow {
  invested: number;
  value: number;
  interest: number;
}

const calculatePositionsGrowth = (
  positionsTotal: number,
  rate: InvestmentRate,
  projectionYears: number,
  firstYearMonths: number,
): StreamRow[] => {
  const monthlyRate = rate / 100 / 12;
  const result: StreamRow[] = [];
  const invested = positionsTotal;
  let value = positionsTotal;

  for (let m = 0; m < firstYearMonths; m++) {
    value *= 1 + monthlyRate;
  }
  result.push({ invested, value, interest: value - invested });

  for (let y = 1; y <= projectionYears; y++) {
    for (let m = 0; m < 12; m++) {
      value *= 1 + monthlyRate;
    }
    result.push({ invested, value, interest: value - invested });
  }

  return result;
};

interface PlansStreamRow extends StreamRow {
  effectiveInvested: number;
}

const calculatePlansGrowth = (
  rate: InvestmentRate,
  nominalMonthly: number,
  entryFeeRate: number,
  projectionYears: number,
  firstYearMonths: number,
  savingsData: SavingsData,
  startYear: number,
): PlansStreamRow[] => {
  const monthlyRate = rate / 100 / 12;
  const entryMultiplier = 1 - entryFeeRate;
  const result: PlansStreamRow[] = [];

  let value = 0;
  let invested = 0;
  let effectiveInvested = 0;

  const startMonthIndex = 12 - firstYearMonths;
  const firstYearKey = String(startYear);
  const firstYearSaved = savingsData[firstYearKey];

  for (let m = startMonthIndex; m < 12; m++) {
    value *= 1 + monthlyRate;
    const nominal = getMonthlyDeposit(firstYearSaved, m, nominalMonthly);
    const effective = nominal * entryMultiplier;
    value += effective;
    invested += nominal;
    effectiveInvested += effective;
  }
  result.push({ invested, effectiveInvested, value, interest: value - effectiveInvested });

  for (let y = 1; y <= projectionYears; y++) {
    const yearKey = String(startYear + y);
    const yearSaved = savingsData[yearKey];

    for (let m = 0; m < 12; m++) {
      value *= 1 + monthlyRate;
      const nominal = getMonthlyDeposit(yearSaved, m, nominalMonthly);
      const effective = nominal * entryMultiplier;
      value += effective;
      invested += nominal;
      effectiveInvested += effective;
    }
    result.push({ invested, effectiveInvested, value, interest: value - effectiveInvested });
  }

  return result;
};

export const buildCombinedData = (params: BuildCombinedDataParams): CombinedYearRow[] => {
  const pensionData = calculatePensionData(params.pensionInputs, params.projectionYears);

  const positionsData = calculatePositionsGrowth(
    params.positionsTotal,
    params.rate,
    params.projectionYears,
    params.firstYearMonths,
  );

  const totalNominalMonthly = params.monthlyPlans.reduce((sum, p) => sum + p.monthlyAmount, 0);
  const totalWeightedMonthly = params.monthlyPlans.reduce((sum, p) => sum + p.monthlyAmount * p.entryFeeRate, 0);
  const avgEntryFeeRate = totalNominalMonthly > 0 ? totalWeightedMonthly / totalNominalMonthly : 0;

  const plansData = calculatePlansGrowth(
    params.rate,
    totalNominalMonthly,
    avgEntryFeeRate,
    params.projectionYears,
    params.firstYearMonths,
    params.savingsData,
    params.startYear,
  );

  return positionsData.map((pos, i) => {
    const plan = plansData[i];
    const pension = pensionData[i];
    const year = params.investmentYears[i];
    const age = year - BIRTH_YEAR;

    const positionsTransactionCosts = pos.invested * params.transactionFeeRate;
    const positionsTaxableProfit = Math.max(pos.interest, 0);
    const positionsCapitalGainsTax =
      Math.floor(positionsTaxableProfit / CAPITAL_GAINS_TAX_THRESHOLD) *
      CAPITAL_GAINS_TAX_THRESHOLD *
      params.capitalGainsTaxRate;
    const positionsNetValue = pos.value - positionsTransactionCosts - positionsCapitalGainsTax;

    const holdingYears = i + params.firstYearMonths / 12;
    const exitFeeRate = getWeightedExitFeeRate(holdingYears, params.monthlyPlans);
    const plansEntryFees = plan.invested - plan.effectiveInvested;
    const plansExitFees = plan.value * exitFeeRate;
    const plansNetValue = plan.value - plansExitFees;

    const investmentInvested = pos.invested + plan.invested;
    const investmentValue = pos.value + plan.value;
    const investmentInterest = pos.interest + plan.interest;
    const investmentTransactionCosts = positionsTransactionCosts + plansExitFees;
    const investmentCapitalGainsTax = positionsCapitalGainsTax;
    const investmentNetValue = positionsNetValue + plansNetValue;

    const pensionRecapture = pension.valueTotal * params.pensionRecaptureRate;
    const pensionNetValue = pension.valueTotal - pensionRecapture;

    // Cash groeit niet mee en blijft buiten `profitPercent`: het rendementscijfer gaat
    // over wat er belegd is, niet over wat er stil op een rekening staat.
    const cashTotal = params.cashReserve + params.boleroCash;

    const totalValue = investmentValue + pension.valueTotal + cashTotal;
    const totalInvested = investmentInvested + pension.investedTotal;
    const profitPercent =
      totalInvested > 0
        ? Math.round((1000 * (investmentValue + pension.valueTotal - totalInvested)) / totalInvested) / 10
        : 0;
    const totalNetValue = investmentNetValue + pensionNetValue + cashTotal;

    return {
      year,
      age,

      positionsInvested: pos.invested,
      positionsValue: pos.value,
      positionsTransactionCosts,
      positionsCapitalGainsTax,
      positionsNetValue,

      plansInvested: plan.invested,
      plansEffectiveInvested: plan.effectiveInvested,
      plansValue: plan.value,
      plansEntryFees,
      plansExitFees,
      plansNetValue,

      investmentInvested,
      investmentValue,
      investmentInterest,
      investmentTransactionCosts,
      investmentCapitalGainsTax,
      investmentNetValue,
      investmentMonthly: totalNominalMonthly,

      pensionInvested: pension.investedTotal,
      pensionValue: pension.valueTotal,
      pensionMonthly: i === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027,
      pensionRecapture,
      pensionNetValue,

      cashReserve: params.cashReserve,
      boleroCash: params.boleroCash,
      totalValue,
      profitPercent,
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
  return (
    row.positionsTransactionCosts +
    row.positionsCapitalGainsTax +
    row.plansEntryFees +
    row.plansExitFees +
    row.pensionRecapture
  );
};

export const getNominalMonthlyTotal = (plans: MonthlyInvestmentPlan[]): number =>
  plans.reduce((sum, p) => sum + p.monthlyAmount, 0);

export const getEffectiveMonthlyTotal = (plans: MonthlyInvestmentPlan[]): number =>
  plans.reduce((sum, p) => sum + p.monthlyAmount * (1 - p.entryFeeRate), 0);

export const getWeightedEntryFeeRate = (plans: MonthlyInvestmentPlan[]): number => {
  const totalMonthly = getNominalMonthlyTotal(plans);
  if (totalMonthly === 0) {
    return 0;
  }

  return plans.reduce((sum, p) => sum + p.entryFeeRate * p.monthlyAmount, 0) / totalMonthly;
};

export const calculateAnnualDividend = (position: InvestmentPosition, cadToEur: number): number | null => {
  if (!position.shares || !position.dividendPerShare || !position.dividendFrequencyPerYear) {
    return null;
  }

  return position.shares * position.dividendPerShare * position.dividendFrequencyPerYear * cadToEur;
};

/** Som van de werkelijk uitbetaalde dividenden; de prognose blijft `calculateAnnualDividend`. */
export const getDividendReceivedTotal = (position: InvestmentPosition): number =>
  (position.dividendPayouts ?? []).reduce((sum, payout) => sum + payout.amount, 0);

/** Nieuwste uitkering eerst, zodat de recentste betaling bovenaan staat. */
export const getDividendPayoutsNewestFirst = (position: InvestmentPosition): DividendPayout[] =>
  [...(position.dividendPayouts ?? [])].sort((a, b) => b.paidOnIso.localeCompare(a.paidOnIso));

export const removeAtIndex = <T>(items: T[], index: number): T[] => items.filter((_, i) => i !== index);

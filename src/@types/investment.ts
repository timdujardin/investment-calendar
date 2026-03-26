export type InvestmentRate = 5 | 7 | 10;

export interface InvestmentPosition {
  name: string;
  ticker: string;
  amount: number;
}

export interface ExitFeeSchedule {
  afterYears: number;
  rate: number;
}

export interface MonthlyInvestmentPlan {
  name: string;
  isin: string;
  monthlyAmount: number;
  entryFeeRate: number;
  exitFees: ExitFeeSchedule[];
  minimumHorizonYears: number;
}

export interface PensionYearRow {
  investedTotal: number;
  valueTotal: number;
  investedCrelan: number;
  investedBaloise: number;
  valueCrelan: number;
  valueBaloise: number;
}

export interface CombinedYearRow {
  year: number;
  age: number;

  positionsInvested: number;
  positionsValue: number;
  positionsTransactionCosts: number;
  positionsCapitalGainsTax: number;
  positionsNetValue: number;

  plansInvested: number;
  plansEffectiveInvested: number;
  plansValue: number;
  plansEntryFees: number;
  plansExitFees: number;
  plansNetValue: number;

  investmentInvested: number;
  investmentValue: number;
  investmentInterest: number;
  investmentTransactionCosts: number;
  investmentCapitalGainsTax: number;
  investmentNetValue: number;
  investmentMonthly: number;

  pensionInvested: number;
  pensionValue: number;
  pensionMonthly: number;
  pensionRecapture: number;
  pensionNetValue: number;

  cashReserve: number;
  totalValue: number;
  profitPercent: number;
  totalNetValue: number;
}

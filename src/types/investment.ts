export type InvestmentRate = 5 | 7 | 10;

export interface InvestmentYearRow {
  year: string | number;
  investedAmount: number;
  valueAt5: number;
  valueAt7: number;
  valueAt10: number;
  interestAt5: number;
  interestAt7: number;
  interestAt10: number;
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
  year: string | number;
  age: number;
  investmentInvested: number;
  investmentValue: number;
  investmentInterest: number;
  pensionInvested: number;
  pensionValue: number;
  totalValue: number;
  profitPercent: number;
  investmentMonthly: number;
  pensionMonthly: number;
}
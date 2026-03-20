export type InvestmentRate = 5 | 7 | 10;

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
  investmentInvested: number;
  investmentValue: number;
  investmentInterest: number;
  pensionInvested: number;
  pensionValue: number;
  cashReserve: number;
  totalValue: number;
  profitPercent: number;
  investmentMonthly: number;
  pensionMonthly: number;
  pensionRecapture: number;
  pensionNetValue: number;
  investmentTransactionCosts: number;
  investmentCapitalGainsTax: number;
  investmentNetValue: number;
  totalNetValue: number;
}

export const compoundImpactNet = (
  amount: number,
  annualRate: number,
  years: number,
  transactionFeeRate: number,
  capitalGainsTaxRate: number,
): number => {
  const bruto = amount * Math.pow(1 + annualRate, years);
  const costs = amount * transactionFeeRate;
  const profit = Math.max(bruto - amount, 0);
  const taxThreshold = 10_000;
  const tax = Math.floor(profit / taxThreshold) * taxThreshold * capitalGainsTaxRate;

  return bruto - costs - tax;
};

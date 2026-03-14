import { useMemo } from 'react';
import { useInvestment } from '../contexts/InvestmentContext';

export function useChartData() {
  const { combinedData } = useInvestment();

  return useMemo(() => {
    return combinedData.map((row) => ({
      year: String(row.year),
      investments: row.investmentValue,
      pension: row.pensionValue,
      total: row.totalValue,
    }));
  }, [combinedData]);
}

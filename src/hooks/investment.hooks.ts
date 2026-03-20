import { useMemo } from 'react';

import type { CombinedYearRow } from '@/@types/investment';
import { useInvestment } from '@/contexts/InvestmentContext';
import { useSettings } from '@/contexts/SettingsContext';

export const useChartData = () => {
  const { combinedData } = useInvestment();

  return useMemo(() => {
    return combinedData.map((row) => ({
      year: String(row.year),
      investments: row.investmentNetValue,
      pension: row.pensionNetValue,
      total: row.totalNetValue,
    }));
  }, [combinedData]);
};

export const useInvestmentPageData = (yearIndex: number) => {
  const { combinedData } = useInvestment();
  const { settings } = useSettings();

  const row = combinedData[yearIndex];
  const prevRow = yearIndex > 0 ? combinedData[yearIndex - 1] : null;

  const yearGrowth = prevRow ? row.investmentValue - prevRow.investmentValue : row.investmentValue;
  const returnOnInvestment =
    row.investmentInvested > 0 ? ((row.investmentInterest / row.investmentInvested) * 100).toFixed(1) : '0.0';
  const isTargetReached = row.totalNetValue >= settings.targetAmount;
  const wasTargetReachedBefore = prevRow ? prevRow.totalNetValue >= settings.targetAmount : false;

  return { row, prevRow, yearGrowth, returnOnInvestment, isTargetReached, wasTargetReachedBefore };
};

export const useInvestmentChartData = () => {
  const { combinedData } = useInvestment();

  return useMemo(
    () =>
      combinedData.map((r) => ({
        year: String(r.year),
        netto: r.investmentNetValue,
        kosten: r.investmentTransactionCosts + r.investmentCapitalGainsTax,
      })),
    [combinedData],
  );
};

export const usePensionPageData = (yearIndex: number) => {
  const { pensionData, combinedData } = useInvestment();
  const { investmentYears, settings } = useSettings();

  const row = pensionData[yearIndex];
  const combined = combinedData[yearIndex];
  const year = investmentYears[yearIndex];
  const recapturePercent = (settings.pensionRecaptureRate * 100).toFixed(0);
  const totalInterest = row.valueTotal - row.investedTotal;
  const returnPercent = row.investedTotal > 0 ? ((totalInterest / row.investedTotal) * 100).toFixed(1) : '0.0';

  return { row, combined, year, recapturePercent, totalInterest, returnPercent };
};

export const usePensionChartData = () => {
  const { combinedData } = useInvestment();

  return useMemo(
    () =>
      combinedData.map((r: CombinedYearRow) => ({
        year: String(r.year),
        netto: r.pensionNetValue,
        terugvordering: r.pensionRecapture,
      })),
    [combinedData],
  );
};

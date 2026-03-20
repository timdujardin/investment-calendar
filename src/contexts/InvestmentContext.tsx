import { createContext, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

import { INVESTMENT_FIRST_YEAR_MONTHS } from '@config/investment.config';
import { useSettings } from '@/contexts/SettingsContext';
import { loadSavingsData, onSavingsChanged } from '@/hooks/savingsTracker.hooks';
import { buildCombinedData, calculatePensionData } from '@/utils/investmentCalculation.util';

interface InvestmentContextValue {
  combinedData: ReturnType<typeof buildCombinedData>;
  pensionData: ReturnType<typeof calculatePensionData>;
}

const InvestmentContext = createContext<InvestmentContextValue | null>(null);

const InvestmentProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, projectionYears, investmentYears } = useSettings();
  const [savingsData, setSavingsData] = useState(loadSavingsData);

  useEffect(() => {
    return onSavingsChanged(() => setSavingsData(loadSavingsData()));
  }, []);

  const pensionRates = useMemo(
    () => ({ crelanRate: settings.crelanRate, baloiseRate: settings.baloiseRate }),
    [settings.crelanRate, settings.baloiseRate],
  );

  const value = useMemo(() => {
    const params = {
      rate: settings.rate,
      pensionRates,
      cashReserve: settings.cashReserve,
      startingValue: settings.currentInvestedAmount,
      projectionYears,
      firstYearMonths: INVESTMENT_FIRST_YEAR_MONTHS,
      monthlyFirstYear: settings.investmentMonthlyFirstYear,
      monthlyAfterFirstYear: settings.investmentMonthly,
      savingsData,
      startYear: settings.startYear,
      investmentYears,
      pensionRecaptureRate: settings.pensionRecaptureRate,
      transactionFeeRate: settings.transactionFeeRate,
      capitalGainsTaxRate: settings.capitalGainsTaxRate,
    };
    const combinedData = buildCombinedData(params);
    const pensionData = calculatePensionData(pensionRates, projectionYears);

    return { combinedData, pensionData };
  }, [settings, pensionRates, projectionYears, investmentYears, savingsData]);

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>;
};

const useInvestment = () => {
  const ctx = useContext(InvestmentContext);
  if (!ctx) {
    throw new Error('useInvestment must be used within InvestmentProvider');
  }

  return ctx;
};

export { InvestmentProvider, useInvestment };

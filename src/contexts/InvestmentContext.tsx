import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';

import { CRELAN_RATE, INVESTMENT_FIRST_YEAR_MONTHS } from '@config/investment.config';
import { useSettings } from '@/contexts/SettingsContext';
import { useCrelanPosition } from '@/hooks/crelan.hooks';
import { useSavingsData } from '@/hooks/savingsTracker.hooks';
import { buildCombinedData, calculatePensionData } from '@/utils/investmentCalculation.util';

interface InvestmentContextValue {
  combinedData: ReturnType<typeof buildCombinedData>;
  pensionData: ReturnType<typeof calculatePensionData>;
}

const InvestmentContext = createContext<InvestmentContextValue | null>(null);

const InvestmentProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, positionsTotal, projectionYears, investmentYears } = useSettings();
  const savingsData = useSavingsData();
  const crelanPosition = useCrelanPosition();

  const pensionInputs = useMemo(
    () => ({
      crelanRate: CRELAN_RATE,
      baloiseRate: settings.baloiseRate,
      crelanStartValue: crelanPosition.value,
      crelanInvested: crelanPosition.invested,
    }),
    [settings.baloiseRate, crelanPosition.value, crelanPosition.invested],
  );

  const value = useMemo(() => {
    const params = {
      rate: settings.rate,
      pensionInputs,
      cashReserve: settings.cashReserve,
      boleroCash: settings.boleroCash,
      positionsTotal,
      monthlyPlans: settings.monthlyPlans,
      projectionYears,
      firstYearMonths: INVESTMENT_FIRST_YEAR_MONTHS,
      savingsData,
      startYear: settings.startYear,
      investmentYears,
      pensionRecaptureRate: settings.pensionRecaptureRate,
      transactionFeeRate: settings.transactionFeeRate,
      capitalGainsTaxRate: settings.capitalGainsTaxRate,
    };
    const combinedData = buildCombinedData(params);
    const pensionData = calculatePensionData(pensionInputs, projectionYears);

    return { combinedData, pensionData };
  }, [settings, pensionInputs, positionsTotal, projectionYears, investmentYears, savingsData]);

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

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  buildCombinedData,
  calculatePensionData,
} from '../utils/investmentCalculation.util';
import { useSettings } from './SettingsContext';

interface InvestmentContextValue {
  combinedData: ReturnType<typeof buildCombinedData>;
  pensionData: ReturnType<typeof calculatePensionData>;
}

const InvestmentContext = createContext<InvestmentContextValue | null>(null);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  const pensionRates = useMemo(
    () => ({ crelanRate: settings.crelanRate, baloiseRate: settings.baloiseRate }),
    [settings.crelanRate, settings.baloiseRate],
  );

  const value = useMemo(() => {
    const combinedData = buildCombinedData(settings.rate, pensionRates);
    const pensionData = calculatePensionData(pensionRates);

    return { combinedData, pensionData };
  }, [settings.rate, pensionRates]);

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const ctx = useContext(InvestmentContext);
  if (!ctx) {
    throw new Error('useInvestment must be used within InvestmentProvider');
  }
  return ctx;
}

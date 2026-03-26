import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import {
  BIRTH_YEAR,
  BALOISE_RATE as DEFAULT_BALOISE_RATE,
  CAPITAL_GAINS_TAX_RATE as DEFAULT_CAPITAL_GAINS_TAX,
  CASH_RESERVE as DEFAULT_CASH_RESERVE,
  END_YEAR as DEFAULT_END_YEAR,
  INVESTMENT_MONTHLY as DEFAULT_MONTHLY,
  INVESTMENT_POSITIONS as DEFAULT_POSITIONS,
  MONTHLY_INVESTMENT_PLANS as DEFAULT_PLANS,
  PENSION_RECAPTURE_RATE as DEFAULT_PENSION_RECAPTURE,
  START_YEAR as DEFAULT_START_YEAR,
  TARGET_AT_40 as DEFAULT_TARGET,
  TARGET_AGE as DEFAULT_TARGET_AGE,
  INVESTMENT_TRANSACTION_FEE_RATE as DEFAULT_TRANSACTION_FEE,
} from '@config/investment.config';
import type { InvestmentPosition, InvestmentRate, MonthlyInvestmentPlan } from '@/@types/investment';

const STORAGE_KEY = 'investment-calendar-settings';

export interface AppSettings {
  rate: InvestmentRate;
  targetAmount: number;
  targetAge: number;
  startYear: number;
  endYear: number;
  positions: InvestmentPosition[];
  monthlyPlans: MonthlyInvestmentPlan[];
  cashReserve: number;
  investmentMonthly: number;
  baloiseRate: number;
  pensionRecaptureRate: number;
  transactionFeeRate: number;
  capitalGainsTaxRate: number;
}

const DEFAULTS: AppSettings = {
  rate: 5,
  targetAmount: DEFAULT_TARGET,
  targetAge: DEFAULT_TARGET_AGE,
  startYear: DEFAULT_START_YEAR,
  endYear: DEFAULT_END_YEAR,
  positions: DEFAULT_POSITIONS,
  monthlyPlans: DEFAULT_PLANS,
  cashReserve: DEFAULT_CASH_RESERVE,
  investmentMonthly: DEFAULT_MONTHLY,
  baloiseRate: DEFAULT_BALOISE_RATE,
  pensionRecaptureRate: DEFAULT_PENSION_RECAPTURE,
  transactionFeeRate: DEFAULT_TRANSACTION_FEE,
  capitalGainsTaxRate: DEFAULT_CAPITAL_GAINS_TAX,
};

const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULTS };
    }

    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
};

const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

interface SettingsContextValue {
  settings: AppSettings;
  positionsTotal: number;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  projectionYears: number;
  rowIndexAtTarget: number;
  investmentYears: readonly number[];
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveSettings({ ...DEFAULTS });
  }, []);

  const derived = useMemo(() => {
    const projectionYears = settings.endYear - settings.startYear;
    const rowIndexAtTarget = settings.targetAge - (settings.startYear - BIRTH_YEAR);
    const investmentYears: readonly number[] = [
      settings.startYear,
      ...Array.from({ length: projectionYears }, (_, i) => settings.startYear + 1 + i),
    ];
    const positionsTotal = settings.positions.reduce((sum, p) => sum + p.amount, 0);

    return { projectionYears, rowIndexAtTarget, investmentYears, positionsTotal };
  }, [settings.startYear, settings.endYear, settings.targetAge, settings.positions]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, ...derived }),
    [settings, updateSettings, resetSettings, derived],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return ctx;
};

export { SettingsProvider, useSettings };

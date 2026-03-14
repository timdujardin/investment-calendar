import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { InvestmentRate } from '../types/investment';
import {
  TARGET_AT_40 as DEFAULT_TARGET,
  TARGET_AGE as DEFAULT_TARGET_AGE,
  START_YEAR as DEFAULT_START_YEAR,
  END_YEAR as DEFAULT_END_YEAR,
  INVESTMENT_MONTHLY_2026 as DEFAULT_MONTHLY_2026,
  INVESTMENT_MONTHLY_FROM_2027 as DEFAULT_MONTHLY_FROM_2027,
  CRELAN_RATE as DEFAULT_CRELAN_RATE,
  BALOISE_RATE as DEFAULT_BALOISE_RATE,
  BIRTH_YEAR,
} from '../../config/investment.config';

const STORAGE_KEY = 'investment-calendar-settings';

export interface AppSettings {
  rate: InvestmentRate;
  targetAmount: number;
  targetAge: number;
  startYear: number;
  endYear: number;
  investmentMonthlyFirstYear: number;
  investmentMonthly: number;
  crelanRate: number;
  baloiseRate: number;
}

const DEFAULTS: AppSettings = {
  rate: 7,
  targetAmount: DEFAULT_TARGET,
  targetAge: DEFAULT_TARGET_AGE,
  startYear: DEFAULT_START_YEAR,
  endYear: DEFAULT_END_YEAR,
  investmentMonthlyFirstYear: DEFAULT_MONTHLY_2026,
  investmentMonthly: DEFAULT_MONTHLY_FROM_2027,
  crelanRate: DEFAULT_CRELAN_RATE,
  baloiseRate: DEFAULT_BALOISE_RATE,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  projectionYears: number;
  rowIndexAtTarget: number;
  investmentYears: readonly (string | number)[];
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
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
    const investmentYears: readonly (string | number)[] = [
      `${settings.startYear} (apr–dec)`,
      ...Array.from({ length: projectionYears }, (_, i) => settings.startYear + 1 + i),
    ];
    return { projectionYears, rowIndexAtTarget, investmentYears };
  }, [settings.startYear, settings.endYear, settings.targetAge]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, ...derived }),
    [settings, updateSettings, resetSettings, derived],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

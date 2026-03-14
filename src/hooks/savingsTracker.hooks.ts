import { useState, useCallback, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const STORAGE_KEY = 'investment-calendar-savings';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
] as const;

export type MonthlySavingsRecord = Record<string, Record<number, number | null>>;

const PREFILLED: MonthlySavingsRecord = {
  '2026': { 0: 450, 1: 500 },
};

export function loadSavingsData(): MonthlySavingsRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(PREFILLED);
    return JSON.parse(raw) as MonthlySavingsRecord;
  } catch {
    return structuredClone(PREFILLED);
  }
}

const SAVINGS_CHANGED_EVENT = 'savings-updated';

export function onSavingsChanged(listener: () => void) {
  window.addEventListener(SAVINGS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(SAVINGS_CHANGED_EVENT, listener);
}

function saveToStorage(data: MonthlySavingsRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(SAVINGS_CHANGED_EVENT));
}

export interface MonthEntry {
  monthIndex: number;
  label: string;
  target: number;
  saved: number | null;
  cumulativeSaved: number;
  cumulativeTarget: number;
  difference: number;
  isOnTrack: boolean;
}

export function useSavingsTracker(year: number) {
  const { settings } = useSettings();
  const [data, setData] = useState<MonthlySavingsRecord>(loadSavingsData);

  const target = year <= settings.startYear
    ? settings.investmentMonthlyFirstYear
    : settings.investmentMonthly;

  const setSaved = useCallback((monthIndex: number, value: number | null) => {
    setData((prev) => {
      const yearKey = String(year);
      const yearData = { ...prev[yearKey] };
      if (value === null) {
        delete yearData[monthIndex];
      } else {
        yearData[monthIndex] = value;
      }
      const next = { ...prev, [yearKey]: yearData };
      saveToStorage(next);
      return next;
    });
  }, [year]);

  const months: MonthEntry[] = useMemo(() => {
    const yearKey = String(year);
    const yearData = data[yearKey] ?? {};
    let cumulativeSaved = 0;
    let cumulativeTarget = 0;

    return MONTH_LABELS.map((label, i) => {
      const saved = yearData[i] ?? null;
      cumulativeTarget += target;
      if (saved !== null) {
        cumulativeSaved += saved;
      }

      return {
        monthIndex: i,
        label,
        target,
        saved,
        cumulativeSaved,
        cumulativeTarget,
        difference: cumulativeSaved - cumulativeTarget,
        isOnTrack: cumulativeSaved >= cumulativeTarget,
      };
    });
  }, [data, year, target]);

  const totalSaved = months.reduce((sum, m) => sum + (m.saved ?? 0), 0);
  const totalTarget = target * 12;
  const filledMonths = months.filter((m) => m.saved !== null).length;

  return { months, totalSaved, totalTarget, filledMonths, target, setSaved };
}

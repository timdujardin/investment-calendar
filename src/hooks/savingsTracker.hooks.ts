import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { useSettings } from '@/contexts/SettingsContext';

const STORAGE_KEY = 'investment-calendar-savings';

const MONTH_LABELS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'] as const;

export type MonthlySavingsRecord = Record<string, Record<number, number | null>>;

const PREFILLED: MonthlySavingsRecord = {};

export const loadSavingsData = (): MonthlySavingsRecord => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(PREFILLED);
    }

    return JSON.parse(raw) as MonthlySavingsRecord;
  } catch {
    return structuredClone(PREFILLED);
  }
};

const SAVINGS_CHANGED_EVENT = 'savings-updated';

export const onSavingsChanged = (listener: () => void) => {
  window.addEventListener(SAVINGS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(SAVINGS_CHANGED_EVENT, listener);
};

/**
 * `loadSavingsData` parset JSON en geeft dus elke aanroep een nieuw object terug. Zonder
 * deze cache zou `useSyncExternalStore` bij elke render een gewijzigde snapshot zien en
 * eindeloos hertekenen. `saveToStorage` is de enige schrijfweg, dus daar volstaat het om
 * de cache te verversen.
 */
let savingsSnapshot: MonthlySavingsRecord | null = null;

export const getSavingsSnapshot = (): MonthlySavingsRecord => {
  savingsSnapshot ??= loadSavingsData();

  return savingsSnapshot;
};

const saveToStorage = (data: MonthlySavingsRecord) => {
  savingsSnapshot = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(SAVINGS_CHANGED_EVENT));
};

/** Abonneert op de opgeslagen spaardata; alle lezers delen dezelfde snapshot. */
export const useSavingsData = (): MonthlySavingsRecord => useSyncExternalStore(onSavingsChanged, getSavingsSnapshot);

interface MonthEntry {
  monthIndex: number;
  label: string;
  target: number;
  saved: number | null;
  cumulativeSaved: number;
  cumulativeTarget: number;
  difference: number;
  isOnTrack: boolean;
}

export const useSavingsTracker = (year: number) => {
  const { settings } = useSettings();
  const data = useSavingsData();

  const target = settings.investmentMonthly;

  const setSaved = useCallback(
    (monthIndex: number, value: number | null) => {
      const previous = getSavingsSnapshot();
      const yearKey = String(year);
      const yearData = { ...previous[yearKey] };
      if (value === null) {
        delete yearData[monthIndex];
      } else {
        yearData[monthIndex] = value;
      }
      saveToStorage({ ...previous, [yearKey]: yearData });
    },
    [year],
  );

  const months: MonthEntry[] = useMemo(() => {
    const yearKey = String(year);
    const yearData = data[yearKey] ?? {};
    let cumulativeSaved = 0;
    let cumulativeTarget = 0;

    return MONTH_LABELS.map((label, i) => {
      const saved = yearData[i] ?? null;
      // eslint-disable-next-line react-hooks/immutability
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
  const lastFilledMonth = months.filter((m) => m.saved !== null).at(-1) ?? null;

  const chartData = months.map((m) => ({
    month: m.label,
    doel: m.cumulativeTarget,
    gespaard: m.saved !== null ? m.cumulativeSaved : null,
  }));

  return { months, totalSaved, totalTarget, filledMonths, target, setSaved, lastFilledMonth, chartData };
};

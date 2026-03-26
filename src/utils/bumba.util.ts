import { A11Y_BUMPS, A11Y_START_DATE, INDEX_ADJUSTMENTS } from '@config/bumba.config';
import type { BumbaEntry, CompanyPeriod, RaiseEvent, YearlySummary } from '@/@types/bumba';

const average = (values: number[]): number | null => {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, v) => sum + v, 0) / values.length;
};

export const getIncludedEntries = (data: BumbaEntry[]): BumbaEntry[] => {
  return data.filter((e) => e.included && e.gross !== null);
};

export const getYearlySummaries = (data: BumbaEntry[]): YearlySummary[] => {
  const byYear = new Map<number, BumbaEntry[]>();
  for (const entry of data) {
    const list = byYear.get(entry.year) ?? [];
    list.push(entry);
    byYear.set(entry.year, list);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, entries]) => {
      const included = entries.filter((e) => e.included && e.gross !== null);
      const grossValues = included.map((e) => e.gross!);
      const netValues = included.filter((e) => e.net !== null).map((e) => e.net!);
      const ratioValues = included.filter((e) => e.ratio !== null).map((e) => e.ratio!);

      const raises = entries.filter((e) => e.raise !== null);
      const totalRaises = raises.reduce((sum, e) => sum + e.raise!, 0);

      const premiumEntry = entries.find((e) => e.premium !== null);
      const lastEntry = included.at(-1) ?? entries.at(-1)!;

      return {
        year,
        avgGross: average(grossValues),
        avgNet: average(netValues),
        avgRatio: average(ratioValues),
        totalRaises,
        premium: premiumEntry?.premium ?? null,
        company: lastEntry.company,
        jobTitle: lastEntry.jobTitle,
        entryCount: included.length,
      };
    });
};

export const getRaiseEvents = (data: BumbaEntry[]): RaiseEvent[] => {
  return data
    .filter((e) => e.raise !== null && e.raise !== 0)
    .map((e) => ({
      date: e.date,
      year: e.year,
      month: e.month,
      percentage: e.raise!,
      newGross: e.gross,
      ratio: e.ratio,
      note: e.note,
      company: e.company,
    }));
};

export const getCompanyPeriods = (data: BumbaEntry[]): CompanyPeriod[] => {
  if (data.length === 0) {
    return [];
  }

  const periods: CompanyPeriod[] = [];
  let currentCompany = data[0].company;
  let currentJobTitle = data[0].jobTitle;
  let startDate = data[0].date;
  let startGross = data[0].gross;

  for (let i = 1; i < data.length; i++) {
    const entry = data[i];
    if (entry.company !== currentCompany || entry.jobTitle !== currentJobTitle) {
      const prev = data[i - 1];
      periods.push({
        company: currentCompany,
        jobTitle: currentJobTitle,
        startDate,
        endDate: prev.date,
        startGross,
        endGross: prev.gross,
      });
      currentCompany = entry.company;
      currentJobTitle = entry.jobTitle;
      startDate = entry.date;
      startGross = entry.gross;
    }
  }

  const last = data.at(-1)!;
  periods.push({
    company: currentCompany,
    jobTitle: currentJobTitle,
    startDate,
    endDate: last.date,
    startGross,
    endGross: last.gross,
  });

  return periods;
};

export const getGrossGrowthPercent = (data: BumbaEntry[]): number | null => {
  const included = getIncludedEntries(data);
  const first = included.at(0);
  const last = included.at(-1);
  if (!first?.gross || !last?.gross) {
    return null;
  }

  return ((last.gross - first.gross) / first.gross) * 100;
};

export const groupEntriesByYear = (entries: BumbaEntry[]): Map<number, BumbaEntry[]> => {
  const map = new Map<number, BumbaEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.year) ?? [];
    list.push(entry);
    map.set(entry.year, list);
  }

  return map;
};

export const getA11yImpact = (date: string): number => {
  if (date < A11Y_START_DATE) {
    return 0;
  }

  let total = 0;

  for (const bump of A11Y_BUMPS) {
    if (bump.date > date) {
      continue;
    }

    let compounded = bump.amount;
    for (const idx of INDEX_ADJUSTMENTS) {
      if (idx.date > bump.date && idx.date <= date) {
        compounded *= 1 + idx.rate;
      }
    }
    total += compounded;
  }

  return Math.round(total * 100) / 100;
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';

  return `${sign}${(value * 100).toFixed(1)}%`;
};

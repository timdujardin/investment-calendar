import {
  A11Y_BUMPS,
  A11Y_START_DATE,
  INDEX_ADJUSTMENTS,
  INDEX_CEILING,
  MARGINAL_NET_RATE,
  MONTH_LABELS,
} from '@config/bumba.config';
import type { BumbaEntry, CompanyPeriod, IndexAdjustment, RaiseEvent, YearlySummary } from '@/@types/bumba';

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

/**
 * Boven het plafond wordt de index niet meer volledig toegekend, dus bepaalt het brutoloon zelf
 * welk percentage van toepassing is.
 */
export const calculateIndexedGross = (gross: number, adjustment: IndexAdjustment): number => {
  const rate = adjustment.cappedRate != null && gross > INDEX_CEILING ? adjustment.cappedRate : adjustment.rate;

  return gross * (1 + rate);
};

const getIndexAdjustmentAt = (date: string): IndexAdjustment | undefined =>
  INDEX_ADJUSTMENTS.find((a) => a.date === date);

const getBumpTotalAt = (date: string): number =>
  A11Y_BUMPS.reduce((sum, bump) => (bump.date === date ? sum + bump.amount : sum), 0);

/**
 * Het scenario zonder a11y-bumps, maand per maand opgebouwd vanaf de vorige maand. Index en gewone
 * loonsprongen gelden in beide scenario's, alleen de bumps blijven eruit.
 *
 * Bij een index met plafond wordt dit scenario apart geindexeerd in plaats van van het echte
 * brutoloon afgetrokken. Dat is het hele punt: zonder de bumps blijf je onder het plafond en krijg
 * je de volle index, terwijl je er met de bumps boven zit en terugvalt op het lagere percentage.
 * De bumps kosten je dus index op je basisloon.
 */
export const buildGrossWithoutA11ySeries = (entries: BumbaEntry[]): Map<string, number> => {
  const series = new Map<string, number>();
  let previous: { gross: number; withoutA11y: number } | null = null;

  for (const entry of entries) {
    if (entry.gross === null) {
      continue;
    }

    if (entry.date < A11Y_START_DATE || previous === null) {
      previous = { gross: entry.gross, withoutA11y: entry.gross };
      continue;
    }

    const adjustment = getIndexAdjustmentAt(entry.date);
    const withoutA11y: number = adjustment
      ? calculateIndexedGross(previous.withoutA11y, adjustment)
      : previous.withoutA11y + (entry.gross - previous.gross - getBumpTotalAt(entry.date));

    series.set(entry.date, withoutA11y);
    previous = { gross: entry.gross, withoutA11y };
  }

  return series;
};

/** Wat de a11y-bumps je opleveren: het verschil tussen je echte brutoloon en het scenario zonder. */
export const getA11yImpact = (gross: number, grossWithoutA11y: number | undefined): number => {
  if (grossWithoutA11y === undefined) {
    return 0;
  }

  return Math.round((gross - grossWithoutA11y) * 100) / 100;
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';

  return `${sign}${(value * 100).toFixed(1)}%`;
};

export interface LineChartEntry {
  date: string;
  gross: number | null;
  net: number | null;
  ratio: number | null;
  company: string;
  grossWithoutA11y: number | null;
  netWithoutA11y: number | null;
}

export interface CompanyZone {
  startDate: string;
  endDate: string;
  company: string;
  index: number;
}

export interface RaiseItem {
  sortKey: string;
  month: number;
  year: number;
  percentage: number;
  note: string | null;
  isIndexation: boolean;
  euroGross: number | null;
  euroNet: number | null;
}

const formatChartDate = (month: number, year: number): string => `${MONTH_LABELS[month]} '${String(year).slice(2)}`;

/**
 * Het brutoverschil met het a11y-scenario valt bovenop je loon, dus daar weegt het marginale
 * tarief op en niet de gemiddelde bruto/netto-ratio van je loon.
 */
export const calculateNetWithoutA11y = (
  net: number | null,
  gross: number | null,
  grossWithoutA11y: number | null,
): number | null => {
  if (net === null || gross === null || grossWithoutA11y === null) {
    return null;
  }

  return Math.round((net - (gross - grossWithoutA11y) * MARGINAL_NET_RATE) * 100) / 100;
};

export const buildLineChartData = (entries: BumbaEntry[]): LineChartEntry[] => {
  const withoutA11ySeries = buildGrossWithoutA11ySeries(entries);

  return entries.map((e) => {
    const withoutA11y = withoutA11ySeries.get(e.date);
    const grossWo = withoutA11y !== undefined ? Math.round(withoutA11y * 100) / 100 : null;

    return {
      date: formatChartDate(e.month, e.year),
      gross: e.gross,
      net: e.net,
      ratio: e.ratio !== null ? e.ratio * 100 : null,
      company: e.company,
      grossWithoutA11y: grossWo,
      netWithoutA11y: calculateNetWithoutA11y(e.net, e.gross, grossWo),
    };
  });
};

export const buildCompanyZones = (lineChartData: LineChartEntry[]): CompanyZone[] => {
  if (lineChartData.length === 0) {
    return [];
  }

  const zones: CompanyZone[] = [];
  let zoneStart = 0;
  let zoneCompany = lineChartData[0].company;

  for (let i = 1; i <= lineChartData.length; i++) {
    if (i === lineChartData.length || lineChartData[i].company !== zoneCompany) {
      zones.push({
        startDate: lineChartData[zoneStart].date,
        endDate: lineChartData[i - 1].date,
        company: zoneCompany,
        index: zones.length,
      });
      if (i < lineChartData.length) {
        zoneStart = i;
        zoneCompany = lineChartData[i].company;
      }
    }
  }

  return zones;
};

export const buildRaiseItems = (raiseEvents: RaiseEvent[], includedEntries: BumbaEntry[]): RaiseItem[] => {
  const items: RaiseItem[] = raiseEvents.map((e) => {
    const isIndexation = e.note != null && /index/i.test(e.note);
    const euroGross =
      e.newGross != null && e.percentage !== 0
        ? Math.round((e.newGross - e.newGross / (1 + e.percentage)) * 100) / 100
        : null;
    const euroNet = euroGross != null ? Math.round(euroGross * MARGINAL_NET_RATE * 100) / 100 : null;

    return {
      sortKey: e.date,
      month: e.month,
      year: e.year,
      percentage: e.percentage * 100,
      note: e.note,
      isIndexation,
      euroGross,
      euroNet,
    };
  });

  const existingDates = new Set(raiseEvents.map((e) => e.date));

  for (const bump of A11Y_BUMPS) {
    if (existingDates.has(bump.date)) {
      continue;
    }

    const entry = includedEntries.find((e) => e.date === bump.date);
    if (!entry || entry.gross == null) {
      continue;
    }

    const pct = (bump.amount / (entry.gross - bump.amount)) * 100;

    items.push({
      sortKey: bump.date,
      month: entry.month,
      year: entry.year,
      percentage: Math.round(pct * 100) / 100,
      note: 'a11y',
      isIndexation: false,
      euroGross: bump.amount,
      euroNet: Math.round(bump.amount * MARGINAL_NET_RATE * 100) / 100,
    });
  }

  return items;
};

export const buildRaiseChartData = (includedEntries: BumbaEntry[], raiseItems: RaiseItem[]) => {
  const byDate = new Map(raiseItems.map((item) => [item.sortKey, item]));

  return includedEntries.map((e) => {
    const item = byDate.get(e.date);

    return {
      date: formatChartDate(e.month, e.year),
      percentage: item?.percentage ?? null,
      note: item?.note ?? null,
      isIndexation: item?.isIndexation ?? false,
      euroGross: item?.euroGross ?? null,
      euroNet: item?.euroNet ?? null,
    };
  });
};

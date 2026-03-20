import { useMemo } from 'react';

import { A11Y_BUMPS, A11Y_START_DATE, MONTH_LABELS, RATIO_CARRY_FORWARD_MONTHS } from '@config/bumba.config';
import { useAuth } from '@/contexts/AuthContext';
import {
  getA11yImpact,
  getCompanyPeriods,
  getGrossGrowthPercent,
  getIncludedEntries,
  getRaiseEvents,
  getYearlySummaries,
} from '@/utils/bumba.util';

export const useBumbaData = () => {
  const { bumbaData } = useAuth();

  return useMemo(() => {
    const allEntries = bumbaData!;
    const includedEntries = getIncludedEntries(allEntries);
    const yearlySummaries = getYearlySummaries(allEntries);
    const raiseEvents = getRaiseEvents(allEntries);
    const companyPeriods = getCompanyPeriods(allEntries);
    const grossGrowthPercent = getGrossGrowthPercent(allEntries);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const pastEntries = includedEntries.filter(
      (e) => e.gross !== null && (e.year < currentYear || (e.year === currentYear && e.month <= currentMonth)),
    );
    const currentEntry = pastEntries.at(-1);
    const firstEntry = includedEntries.at(0);
    const currentYearSummary = yearlySummaries.find((s) => s.year === currentYear) ?? yearlySummaries.at(-1);
    const careerYears = firstEntry && currentEntry ? currentEntry.year - firstEntry.year : 0;

    const lastEntry = includedEntries.at(-1);
    const a11yImpact = lastEntry ? getA11yImpact(lastEntry.date) : 0;
    const grossWithoutA11y = lastEntry?.gross != null ? lastEntry.gross - a11yImpact : null;
    const a11yImpactPercent =
      grossWithoutA11y != null && grossWithoutA11y > 0 ? (a11yImpact / grossWithoutA11y) * 100 : null;

    let lastRatio: number | null = null;
    if (lastEntry) {
      if (RATIO_CARRY_FORWARD_MONTHS.has(lastEntry.date)) {
        const prev = includedEntries.findLast((e) => e.ratio !== null && e.date < lastEntry.date);
        lastRatio = prev?.ratio ?? lastEntry.ratio;
      } else {
        lastRatio = lastEntry.ratio;
      }
    }

    const netWithoutA11y =
      grossWithoutA11y !== null && lastRatio !== null ? Math.round(grossWithoutA11y * lastRatio * 100) / 100 : null;
    const netA11yImpact =
      lastEntry?.net != null && netWithoutA11y !== null ? Math.round((lastEntry.net - netWithoutA11y) * 100) / 100 : null;

    return {
      allEntries,
      includedEntries,
      yearlySummaries,
      raiseEvents,
      companyPeriods,
      grossGrowthPercent,
      currentEntry,
      firstEntry,
      lastEntry,
      currentYearSummary,
      careerYears,
      a11yImpact,
      a11yImpactPercent,
      netWithoutA11y,
      netA11yImpact,
    };
  }, [bumbaData]);
};

export const useBumbaChartData = () => {
  const { includedEntries, raiseEvents, yearlySummaries } = useBumbaData();

  return useMemo(() => {
    const lineChartData: {
      date: string;
      gross: number | null;
      net: number | null;
      ratio: number | null;
      company: string;
      grossWithoutA11y: number | null;
      netWithoutA11y: number | null;
    }[] = [];

    let prevRatio: number | null = null;

    for (const e of includedEntries) {
      const isA11y = e.date >= A11Y_START_DATE;
      const effectiveRatio = RATIO_CARRY_FORWARD_MONTHS.has(e.date) && prevRatio !== null ? prevRatio : e.ratio;
      const grossWo = isA11y && e.gross !== null ? Math.round((e.gross - getA11yImpact(e.date)) * 100) / 100 : null;

      lineChartData.push({
        date: `${MONTH_LABELS[e.month]} '${String(e.year).slice(2)}`,
        gross: e.gross,
        net: e.net,
        ratio: e.ratio !== null ? e.ratio * 100 : null,
        company: e.company,
        grossWithoutA11y: grossWo,
        netWithoutA11y:
          grossWo !== null && effectiveRatio !== null ? Math.round(grossWo * effectiveRatio * 100) / 100 : null,
      });

      if (e.ratio !== null) {
        prevRatio = e.ratio;
      }
    }

    const companyZones: { startDate: string; endDate: string; company: string; index: number }[] = [];
    if (lineChartData.length > 0) {
      let zoneStart = 0;
      let zoneCompany = lineChartData[0].company;
      for (let i = 1; i <= lineChartData.length; i++) {
        if (i === lineChartData.length || lineChartData[i].company !== zoneCompany) {
          companyZones.push({
            startDate: lineChartData[zoneStart].date,
            endDate: lineChartData[i - 1].date,
            company: zoneCompany,
            index: companyZones.length,
          });
          if (i < lineChartData.length) {
            zoneStart = i;
            zoneCompany = lineChartData[i].company;
          }
        }
      }
    }

    const ratioChartData = includedEntries
      .filter((e) => e.ratio !== null)
      .map((e) => ({
        date: `${MONTH_LABELS[e.month]} '${String(e.year).slice(2)}`,
        ratio: e.ratio! * 100,
      }));

    const raiseItems: {
      sortKey: string;
      month: number;
      year: number;
      percentage: number;
      note: string | null;
      isIndexation: boolean;
      euroGross: number | null;
      euroNet: number | null;
    }[] = raiseEvents.map((e) => {
      const isIndexation = e.note != null && /index/i.test(e.note);
      const euroGross =
        e.newGross != null && e.percentage !== 0
          ? Math.round((e.newGross - e.newGross / (1 + e.percentage)) * 100) / 100
          : null;
      const euroNet = euroGross != null && e.ratio != null ? Math.round(euroGross * e.ratio * 100) / 100 : null;

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

    const existingRaiseDates = new Set(raiseEvents.map((e) => e.date));
    for (const bump of A11Y_BUMPS) {
      if (existingRaiseDates.has(bump.date)) continue;
      const entry = includedEntries.find((e) => e.date === bump.date);
      if (!entry || entry.gross == null) continue;

      const pct = (bump.amount / (entry.gross - bump.amount)) * 100;

      raiseItems.push({
        sortKey: bump.date,
        month: entry.month,
        year: entry.year,
        percentage: Math.round(pct * 100) / 100,
        note: 'a11y',
        isIndexation: false,
        euroGross: bump.amount,
        euroNet: entry.ratio != null ? Math.round(bump.amount * entry.ratio * 100) / 100 : null,
      });
    }

    const raiseByDate = new Map(raiseItems.map((item) => [item.sortKey, item]));

    const raiseChartData = includedEntries.map((e) => {
      const item = raiseByDate.get(e.date);

      return {
        date: `${MONTH_LABELS[e.month]} '${String(e.year).slice(2)}`,
        percentage: item?.percentage ?? null,
        note: item?.note ?? null,
        isIndexation: item?.isIndexation ?? false,
        euroGross: item?.euroGross ?? null,
        euroNet: item?.euroNet ?? null,
      };
    });

    const premiumChartData = yearlySummaries
      .filter((s) => s.premium !== null)
      .map((s) => ({
        year: String(s.year),
        premium: s.premium!,
      }));

    return { lineChartData, companyZones, ratioChartData, raiseChartData, premiumChartData };
  }, [includedEntries, raiseEvents, yearlySummaries]);
};

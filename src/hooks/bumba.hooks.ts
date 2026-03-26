import { useMemo } from 'react';

import { MONTH_LABELS, RATIO_CARRY_FORWARD_MONTHS } from '@config/bumba.config';
import { useAuth } from '@/contexts/AuthContext';
import {
  buildCompanyZones,
  buildLineChartData,
  buildRaiseChartData,
  buildRaiseItems,
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
      lastEntry?.net != null && netWithoutA11y !== null
        ? Math.round((lastEntry.net - netWithoutA11y) * 100) / 100
        : null;

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
    const lineChartData = buildLineChartData(includedEntries, RATIO_CARRY_FORWARD_MONTHS);
    const companyZones = buildCompanyZones(lineChartData);

    const ratioChartData = includedEntries
      .filter((e) => e.ratio !== null)
      .map((e) => ({
        date: `${MONTH_LABELS[e.month]} '${String(e.year).slice(2)}`,
        ratio: e.ratio! * 100,
      }));

    const raiseItems = buildRaiseItems(raiseEvents, includedEntries);
    const raiseChartData = buildRaiseChartData(includedEntries, raiseItems);

    const premiumChartData = yearlySummaries
      .filter((s) => s.premium !== null)
      .map((s) => ({
        year: String(s.year),
        premium: s.premium!,
      }));

    return { lineChartData, companyZones, ratioChartData, raiseChartData, premiumChartData };
  }, [includedEntries, raiseEvents, yearlySummaries]);
};

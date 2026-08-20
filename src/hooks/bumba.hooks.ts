import { useMemo } from 'react';

import { MONTH_LABELS } from '@config/bumba.config';
import { useAuth } from '@/contexts/AuthContext';
import {
  buildCompanyZones,
  buildGrossWithoutA11ySeries,
  buildLineChartData,
  buildRaiseChartData,
  buildRaiseItems,
  calculateNetWithoutA11y,
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
    const withoutA11ySeries = buildGrossWithoutA11ySeries(includedEntries);
    const grossWithoutA11y =
      lastEntry?.gross != null ? (withoutA11ySeries.get(lastEntry.date) ?? lastEntry.gross) : null;
    const a11yImpact =
      lastEntry?.gross != null ? getA11yImpact(lastEntry.gross, withoutA11ySeries.get(lastEntry.date)) : 0;
    const a11yImpactPercent =
      grossWithoutA11y != null && grossWithoutA11y > 0 ? (a11yImpact / grossWithoutA11y) * 100 : null;

    const netWithoutA11y = calculateNetWithoutA11y(lastEntry?.net ?? null, lastEntry?.gross ?? null, grossWithoutA11y);
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
    const lineChartData = buildLineChartData(includedEntries);
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

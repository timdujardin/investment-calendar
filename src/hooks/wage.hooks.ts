import { useMemo } from 'react';

import { MONTH_LABELS } from '@config/wage.config';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCompanyPeriods,
  getGrossGrowthPercent,
  getIncludedEntries,
  getRaiseEvents,
  getYearlySummaries,
} from '@/utils/wage.util';

export const useWageData = () => {
  const { wageData } = useAuth();

  return useMemo(() => {
    const allEntries = wageData!;
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

    return {
      allEntries,
      includedEntries,
      yearlySummaries,
      raiseEvents,
      companyPeriods,
      grossGrowthPercent,
      currentEntry,
      firstEntry,
      currentYearSummary,
      careerYears,
    };
  }, [wageData]);
};

export const useWageChartData = () => {
  const { includedEntries, raiseEvents, yearlySummaries } = useWageData();

  return useMemo(() => {
    const lineChartData = includedEntries.map((e) => ({
      date: `${MONTH_LABELS[e.month]} '${String(e.year).slice(2)}`,
      gross: e.gross,
      net: e.net,
      ratio: e.ratio !== null ? e.ratio * 100 : null,
      company: e.company,
    }));

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

    const raiseChartData = raiseEvents.map((e) => ({
      date: `${MONTH_LABELS[e.month]} '${String(e.year).slice(2)}`,
      percentage: e.percentage * 100,
      note: e.note,
    }));

    const premiumChartData = yearlySummaries
      .filter((s) => s.premium !== null)
      .map((s) => ({
        year: String(s.year),
        premium: s.premium!,
      }));

    return { lineChartData, companyZones, ratioChartData, raiseChartData, premiumChartData };
  }, [includedEntries, raiseEvents, yearlySummaries]);
};

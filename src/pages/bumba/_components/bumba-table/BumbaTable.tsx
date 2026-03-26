import { useCallback, useMemo, useState, type FC } from 'react';

import { useBumbaData } from '@/hooks/bumba.hooks';
import { formatPercent, groupEntriesByYear } from '@/utils/bumba.util';
import { formatCurrency } from '@/utils/format.util';

import { MonthRow } from './_components/month-row/MonthRow';

const BumbaTable: FC = () => {
  const { allEntries, yearlySummaries } = useBumbaData();
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }

      return next;
    });
  }, []);

  const entriesByYear = useMemo(() => groupEntriesByYear(allEntries), [allEntries]);

  return (
    <div className="detail-section">
      <h2 className="detail-section__title">Detail per maand</h2>
      <div className="bumba-table-wrap">
        <table className="bumba-table">
          <thead>
            <tr>
              <th>Periode</th>
              <th>Bruto</th>
              <th>Netto</th>
              <th>Ratio</th>
              <th>Opslag</th>
              <th>Premie</th>
              <th>Bedrijf</th>
              <th>Functie</th>
              <th>Notitie</th>
            </tr>
          </thead>
          {yearlySummaries.map((summary) => {
            const isExpanded = expandedYears.has(summary.year);
            const yearEntries = entriesByYear.get(summary.year) ?? [];

            return (
              <tbody key={summary.year}>
                <tr
                  className="bumba-table__year-row"
                  onClick={() => toggleYear(summary.year)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleYear(summary.year);
                    }
                  }}
                >
                  <td>
                    <span className="bumba-table__chevron">{isExpanded ? '▾' : '▸'}</span>
                    {summary.year}
                  </td>
                  <td className="bumba-table__cell--number">
                    {summary.avgGross !== null ? formatCurrency(summary.avgGross) : '—'}
                  </td>
                  <td className="bumba-table__cell--number">
                    {summary.avgNet !== null ? formatCurrency(summary.avgNet) : '—'}
                  </td>
                  <td className="bumba-table__cell--number">
                    {summary.avgRatio !== null ? `${(summary.avgRatio * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="bumba-table__cell--number">
                    {summary.totalRaises !== 0 ? formatPercent(summary.totalRaises) : ''}
                  </td>
                  <td className="bumba-table__cell--number">
                    {summary.premium !== null ? formatCurrency(summary.premium) : ''}
                  </td>
                  <td>{summary.company}</td>
                  <td>{summary.jobTitle || '—'}</td>
                  <td />
                </tr>
                {isExpanded ? yearEntries.map((entry) => <MonthRow key={entry.date} entry={entry} />) : null}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
};

export { BumbaTable };

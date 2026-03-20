import type { FC } from 'react';

import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useBumbaData } from '@/hooks/bumba.hooks';
import { formatCurrency } from '@/utils/format.util';

import { BumbaLineChart } from './_components/bumba-line-chart/BumbaLineChart';
import { BumbaPremiumChart } from './_components/bumba-premium-chart/BumbaPremiumChart';
import { BumbaRaiseChart } from './_components/bumba-raise-chart/BumbaRaiseChart';
import { BumbaTable } from './_components/bumba-table/BumbaTable';

const BumbaPage: FC = () => {
  const {
    currentEntry,
    firstEntry,
    lastEntry,
    grossGrowthPercent,
    companyPeriods,
    raiseEvents,
    currentYearSummary,
    careerYears,
    a11yImpact,
    a11yImpactPercent,
    netWithoutA11y,
    netA11yImpact,
  } = useBumbaData();

  return (
    <div className="page">
      <PageHeader
        title="Loonsevolutie"
        subtitle={`${careerYears} jaar carriere · ${companyPeriods.length} werkgevers · ${raiseEvents.length} opslag/indexaties`}
      />

      <main className="page__main">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card__label">Huidig loon</div>
            <div className="summary-card__value summary-card__value--green">
              {currentEntry?.net != null ? formatCurrency(currentEntry.net) : '—'}
            </div>
            <div className="summary-card__sub">
              bruto {currentEntry?.gross != null ? formatCurrency(currentEntry.gross) : '—'}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Start loon</div>
            <div className="summary-card__value">{firstEntry?.net != null ? formatCurrency(firstEntry.net) : '—'}</div>
            <div className="summary-card__sub">
              bruto {firstEntry?.gross != null ? formatCurrency(Math.round(firstEntry.gross / 100) * 100) : '—'}
              <br />
              {firstEntry?.company ?? ''}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Gem. ratio {currentYearSummary?.year ?? ''}</div>
            <div className="summary-card__value summary-card__value--purple">
              {currentYearSummary?.avgRatio != null ? `${(currentYearSummary.avgRatio * 100).toFixed(1)}%` : '—'}
            </div>
            <div className="summary-card__sub">netto / bruto</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Bruto groei</div>
            <div className="summary-card__value summary-card__value--orange">
              {grossGrowthPercent !== null ? `+${grossGrowthPercent.toFixed(1)}%` : '—'}
            </div>
            <div className="summary-card__sub">{careerYears} jaar</div>
          </div>
        </div>

        <BumbaLineChart />
        <BumbaRaiseChart />
        <BumbaPremiumChart />
        {a11yImpact > 0 && lastEntry?.gross != null && (
          <div className="dashboard-status dashboard-status--info">
            <div className="dashboard-status__header">
              <span className="dashboard-status__icon">ℹ️</span>
              <span className="dashboard-status__title">Head of a11y impact — {lastEntry.date}</span>
            </div>
            <table className="dashboard-status__table">
              <thead>
                <tr>
                  <td className="dashboard-status__cell-label" />
                  <td className="dashboard-status__cell-value">Zonder a11y</td>
                  <td className="dashboard-status__cell-value">Met a11y</td>
                  <td className="dashboard-status__cell-value">Verschil</td>
                </tr>
              </thead>
              <tbody>
                <tr className="dashboard-status__row--highlight">
                  <td className="dashboard-status__cell-label">Bruto</td>
                  <td className="dashboard-status__cell-value">{formatCurrency(lastEntry.gross - a11yImpact)}</td>
                  <td className="dashboard-status__cell-value">{formatCurrency(lastEntry.gross)}</td>
                  <td className="dashboard-status__cell-value">
                    +{formatCurrency(a11yImpact)}
                    {a11yImpactPercent != null && ` (+${a11yImpactPercent.toFixed(1)}%)`}
                  </td>
                </tr>
                {netWithoutA11y != null && lastEntry.net != null && netA11yImpact != null && (
                  <tr className="dashboard-status__row--highlight">
                    <td className="dashboard-status__cell-label">Netto</td>
                    <td className="dashboard-status__cell-value">{formatCurrency(netWithoutA11y)}</td>
                    <td className="dashboard-status__cell-value">{formatCurrency(lastEntry.net)}</td>
                    <td className="dashboard-status__cell-value">+{formatCurrency(netA11yImpact)}</td>
                  </tr>
                )}
                <tr>
                  <td className="dashboard-status__cell-label">Buitenlandvergoeding</td>
                  <td className="dashboard-status__cell-value" />
                  <td className="dashboard-status__cell-value" />
                  <td className="dashboard-status__cell-value">+{formatCurrency(91.09)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <BumbaTable />
      </main>
    </div>
  );
};

export { BumbaPage };

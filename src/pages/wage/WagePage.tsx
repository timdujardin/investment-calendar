import type { FC } from 'react';

import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useWageData } from '@/hooks/wage.hooks';
import { formatCurrency } from '@/utils/format.util';

import { WageLineChart } from './_components/wage-line-chart/WageLineChart';
import { WagePremiumChart } from './_components/wage-premium-chart/WagePremiumChart';
import { WageRaiseChart } from './_components/wage-raise-chart/WageRaiseChart';
import { WageTable } from './_components/wage-table/WageTable';

const WagePage: FC = () => {
  const { currentEntry, firstEntry, grossGrowthPercent, companyPeriods, raiseEvents, currentYearSummary, careerYears } =
    useWageData();

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
              bruto {firstEntry?.gross != null ? formatCurrency(firstEntry.gross) : '—'}
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

        <WageLineChart />
        <WageRaiseChart />
        <WagePremiumChart />
        <WageTable />
      </main>
    </div>
  );
};

export { WagePage };

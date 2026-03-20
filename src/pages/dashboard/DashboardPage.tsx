import type { FC } from 'react';

import { AppHeader } from './_components/app-header/AppHeader';
import { PrognoseLineChart } from './_components/prognose-line-chart/PrognoseLineChart';
import { SummaryCards } from './_components/summary-cards/SummaryCards';

const DashboardPage: FC = () => {
  return (
    <div className="page">
      <AppHeader />
      <main className="page__main">
        <SummaryCards />
        <PrognoseLineChart />
      </main>
    </div>
  );
};

export { DashboardPage };

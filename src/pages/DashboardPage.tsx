import { AppHeader } from '../components/organisms/AppHeader';
import { DashboardStatus } from '../components/molecules/DashboardStatus';
import { SummaryCards } from '../components/molecules/SummaryCards';
import { PrognoseLineChart } from '../components/molecules/PrognoseLineChart';

export function DashboardPage() {
  return (
    <div className="page">
      <DashboardStatus />
      <main className="page__main">
        <SummaryCards />
        <PrognoseLineChart />
      </main>
      <AppHeader />
    </div>
  );
}

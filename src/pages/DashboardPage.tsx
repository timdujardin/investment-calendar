import { AppHeader } from '../components/organisms/AppHeader';
import { SummaryCards } from '../components/molecules/SummaryCards';
import { PrognoseLineChart } from '../components/molecules/PrognoseLineChart';

export function DashboardPage() {
  return (
    <div className="page">
      <AppHeader />
      <main className="page__main">
        <SummaryCards />
        <PrognoseLineChart />
      </main>
    </div>
  );
}

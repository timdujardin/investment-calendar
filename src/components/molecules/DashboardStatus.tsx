import { useInvestment } from '../../contexts/InvestmentContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useSavingsTracker } from '../../hooks/savingsTracker.hooks';
import { formatCurrency } from '../../utils/format.util';

export function DashboardStatus() {
  const { combinedData } = useInvestment();
  const { rowIndexAtTarget, settings } = useSettings();

  const currentYear = new Date().getFullYear();
  const { months, filledMonths } = useSavingsTracker(currentYear);

  const rowTarget = combinedData[rowIndexAtTarget];
  const projectedTotal = rowTarget?.totalValue ?? 0;
  const hitsGoal = projectedTotal >= settings.targetAmount;

  const lastFilled = months.filter((m) => m.saved !== null).at(-1);
  const savingsOnTrack = lastFilled ? lastFilled.isOnTrack : null;
  const savingsDiff = lastFilled ? lastFilled.difference : 0;

  const allGood = hitsGoal && (savingsOnTrack === null || savingsOnTrack);
  const mixed = hitsGoal && savingsOnTrack === false;

  let icon: string;
  let title: string;
  let subtitle: string;
  let variant: 'ok' | 'warn' | 'info';

  if (allGood && filledMonths > 0) {
    icon = '✓';
    title = 'Je ligt op koers';
    subtitle = `Prognose ${formatCurrency(projectedTotal)} bij ${settings.targetAge} jaar — doel ${formatCurrency(settings.targetAmount)} bereikt`;
    variant = 'ok';
  } else if (mixed) {
    icon = '⚠';
    title = 'Sparen loopt achter';
    subtitle = `${formatCurrency(Math.abs(savingsDiff))} achterstand dit jaar — prognose haalt nog wel je doel`;
    variant = 'warn';
  } else if (!hitsGoal) {
    icon = '✗';
    title = 'Doel wordt niet gehaald';
    subtitle = `Prognose ${formatCurrency(projectedTotal)} bij ${settings.targetAge} jaar — ${formatCurrency(settings.targetAmount - projectedTotal)} tekort`;
    variant = 'warn';
  } else {
    icon = '→';
    title = `Doel: ${formatCurrency(settings.targetAmount)} bij ${settings.targetAge}`;
    subtitle = `Prognose ${formatCurrency(projectedTotal)} — vul je maandelijkse stortingen in om voortgang te zien`;
    variant = 'info';
  }

  return (
    <div className={`dashboard-status dashboard-status--${variant}`}>
      <span className="dashboard-status__icon">{icon}</span>
      <div className="dashboard-status__text">
        <span className="dashboard-status__title">{title}</span>
        <span className="dashboard-status__subtitle">{subtitle}</span>
      </div>
    </div>
  );
}

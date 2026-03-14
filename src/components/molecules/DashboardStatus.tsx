import { useInvestment } from '../../contexts/InvestmentContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useSavingsTracker } from '../../hooks/savingsTracker.hooks';
import { formatCurrency } from '../../utils/format.util';

function compoundImpact(amount: number, annualRate: number, years: number): number {
  return amount * Math.pow(1 + annualRate, years);
}

export function DashboardStatus() {
  const { combinedData } = useInvestment();
  const { rowIndexAtTarget, settings } = useSettings();

  const currentYear = new Date().getFullYear();
  const { months, filledMonths } = useSavingsTracker(currentYear);

  const rowTarget = combinedData[rowIndexAtTarget];
  const projectedNet = rowTarget?.totalNetValue ?? 0;
  const projectedBruto = rowTarget?.totalValue ?? 0;
  const hitsGoal = projectedNet >= settings.targetAmount;

  const lastFilled = months.filter((m) => m.saved !== null).at(-1);
  const savingsOnTrack = lastFilled ? lastFilled.isOnTrack : null;
  const savingsDiff = lastFilled ? lastFilled.difference : 0;

  const allGood = hitsGoal && (savingsOnTrack === null || savingsOnTrack);
  const mixed = hitsGoal && savingsOnTrack === false;

  const targetYear = settings.startYear + rowIndexAtTarget;
  const yearsRemaining = Math.max(targetYear - currentYear, 1);
  const rate = settings.rate / 100;
  const impactAtTarget = compoundImpact(Math.abs(savingsDiff), rate, yearsRemaining);
  const surplus = projectedNet - settings.targetAmount;

  let icon: string;
  let title: string;
  let variant: 'ok' | 'warn' | 'info';

  type StatusLine = { label: string; value: string; highlight?: boolean };
  const lines: StatusLine[] = [];
  let detail: string | null = null;

  const goalLabel = `${formatCurrency(settings.targetAmount)} bij ${settings.targetAge} jaar`;

  if (allGood && filledMonths > 0) {
    icon = '✓';
    title = `Op koers — doel ${goalLabel}`;
    variant = 'ok';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose netto', value: formatCurrency(projectedNet), highlight: true },
      { label: 'Prognose bruto', value: formatCurrency(projectedBruto) },
      { label: 'Boven doel', value: `+${formatCurrency(surplus)}`, highlight: true },
    );

    if (savingsDiff > 0) {
      lines.push({ label: 'Extra inleg dit jaar', value: `+${formatCurrency(savingsDiff)}` });
      detail = `Dat extra bedrag rendeert mee — tegen ${settings.targetAge} jaar circa ${formatCurrency(impactAtTarget)} extra eindkapitaal.`;
    } else {
      detail = `Stortingen volgen exact je planning. Prognose op basis van ${settings.rate}% rendement, na kosten en belasting.`;
    }
  } else if (mixed) {
    icon = '⚠';
    title = `Inleg loopt achter — doel ${goalLabel}`;
    variant = 'warn';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose netto', value: formatCurrency(projectedNet) },
      { label: 'Achterstand dit jaar', value: `-${formatCurrency(Math.abs(savingsDiff))}`, highlight: true },
    );
    detail = `Dat gemiste bedrag mist ook ${yearsRemaining} jaar aan rendement — circa ${formatCurrency(impactAtTarget)} minder eindkapitaal bij ${settings.targetAge} jaar. Haal je de achterstand in, dan groeit dat bedrag alsnog mee.`;
  } else if (!hitsGoal) {
    icon = '✗';
    title = `Doel niet gehaald — doel ${goalLabel}`;
    const shortfall = settings.targetAmount - projectedNet;
    variant = 'warn';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose netto', value: formatCurrency(projectedNet), highlight: true },
      { label: 'Prognose bruto', value: formatCurrency(projectedBruto) },
      { label: 'Tekort', value: `-${formatCurrency(shortfall)}`, highlight: true },
    );

    if (filledMonths > 0 && savingsDiff < 0) {
      lines.push({ label: 'Achterstand dit jaar', value: `-${formatCurrency(Math.abs(savingsDiff))}` });
      detail = `Dat gemiste bedrag mist ook ${yearsRemaining} jaar rendement — circa ${formatCurrency(impactAtTarget)} minder eindkapitaal.`;
    } else {
      detail = `Verhoog je maandelijkse inleg, verlaag je doelbedrag, of verleng de looptijd.`;
    }
  } else {
    icon = '→';
    title = `Doel: ${goalLabel}`;
    variant = 'info';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose netto', value: formatCurrency(projectedNet) },
      { label: 'Prognose bruto', value: formatCurrency(projectedBruto) },
    );
    detail = `Vul je maandelijkse stortingen in om voortgang te zien.`;
  }

  return (
    <div className={`dashboard-status dashboard-status--${variant}`}>
      <div className="dashboard-status__header">
        <span className="dashboard-status__icon">{icon}</span>
        <span className="dashboard-status__title">{title}</span>
      </div>
      <table className="dashboard-status__table">
        <tbody>
          {lines.map((l) => (
            <tr key={l.label} className={l.highlight ? 'dashboard-status__row--highlight' : ''}>
              <td className="dashboard-status__cell-label">{l.label}</td>
              <td className="dashboard-status__cell-value">{l.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {detail && <p className="dashboard-status__detail">{detail}</p>}
    </div>
  );
}

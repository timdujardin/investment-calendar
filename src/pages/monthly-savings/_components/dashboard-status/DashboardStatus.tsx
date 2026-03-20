import type { FC } from 'react';

import { BIRTH_YEAR } from '@config/investment.config';
import { useInvestment } from '@/contexts/InvestmentContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSavingsTracker } from '@/hooks/savingsTracker.hooks';
import { formatCurrency } from '@/utils/format.util';

import { compoundImpactNet } from './dashboard-status.callbacks';

// eslint-disable-next-line sonarjs/cognitive-complexity
const DashboardStatus: FC = () => {
  const { combinedData } = useInvestment();
  const { rowIndexAtTarget, settings } = useSettings();

  const currentYear = new Date().getFullYear();
  const { filledMonths, lastFilledMonth } = useSavingsTracker(currentYear);

  const rowTarget = combinedData[rowIndexAtTarget];
  const projectedNet = rowTarget?.totalNetValue ?? 0;
  const hitsGoal = projectedNet >= settings.targetAmount;

  const savingsOnTrack = lastFilledMonth ? lastFilledMonth.isOnTrack : null;
  const savingsDiff = lastFilledMonth ? lastFilledMonth.difference : 0;

  const allGood = hitsGoal && (savingsOnTrack === null || savingsOnTrack);
  const mixed = hitsGoal && savingsOnTrack === false;

  const targetYear = BIRTH_YEAR + settings.targetAge;
  const yearsRemaining = Math.max(targetYear - currentYear, 1);
  const rate = settings.rate / 100;
  const impactAtTarget = compoundImpactNet(
    Math.abs(savingsDiff),
    rate,
    yearsRemaining,
    settings.transactionFeeRate,
    settings.capitalGainsTaxRate,
  );
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
      { label: 'Prognose', value: formatCurrency(projectedNet), highlight: true },
      { label: 'Boven doel', value: `+${formatCurrency(surplus)}`, highlight: true },
    );

    if (savingsDiff > 0) {
      lines.push({ label: 'Extra inleg dit jaar', value: `+${formatCurrency(savingsDiff)}` });
      detail = `Dat extra bedrag rendeert mee — tegen ${settings.targetAge} jaar circa ${formatCurrency(impactAtTarget)} extra netto eindkapitaal. Netto prognose: ${formatCurrency(projectedNet)}.`;
    } else {
      detail = `Prognose op basis van ${settings.rate}% rendement, na kosten en belasting. Netto prognose: ${formatCurrency(projectedNet)}.`;
    }
  } else if (mixed) {
    icon = '⚠';
    title = `Inleg loopt achter — doel ${goalLabel}`;
    variant = 'warn';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose', value: formatCurrency(projectedNet) },
      { label: 'Achterstand dit jaar', value: `-${formatCurrency(Math.abs(savingsDiff))}`, highlight: true },
    );
    detail = `Dat gemiste bedrag mist ook ${yearsRemaining} jaar aan rendement — circa ${formatCurrency(impactAtTarget)} minder netto eindkapitaal bij ${settings.targetAge} jaar. Netto prognose: ${formatCurrency(projectedNet)}.`;
  } else if (!hitsGoal) {
    icon = '✗';
    title = `Doel niet gehaald — doel ${goalLabel}`;
    const shortfall = settings.targetAmount - projectedNet;
    variant = 'warn';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose', value: formatCurrency(projectedNet), highlight: true },
      { label: 'Tekort', value: `-${formatCurrency(shortfall)}`, highlight: true },
    );

    if (filledMonths > 0 && savingsDiff < 0) {
      lines.push({ label: 'Achterstand dit jaar', value: `-${formatCurrency(Math.abs(savingsDiff))}` });
      detail = `Dat gemiste bedrag mist ook ${yearsRemaining} jaar rendement — circa ${formatCurrency(impactAtTarget)} minder netto eindkapitaal. Netto prognose: ${formatCurrency(projectedNet)}.`;
    } else {
      detail = `Verhoog je maandelijkse inleg, verlaag je doelbedrag, of verleng de looptijd. Netto prognose: ${formatCurrency(projectedNet)}.`;
    }
  } else {
    icon = '→';
    title = `Doel: ${goalLabel}`;
    variant = 'info';

    lines.push(
      { label: 'Doel', value: formatCurrency(settings.targetAmount) },
      { label: 'Prognose', value: formatCurrency(projectedNet) },
    );
    detail = `Vul je maandelijkse stortingen in om voortgang te zien. Netto prognose: ${formatCurrency(projectedNet)}.`;
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
      {detail ? <p className="dashboard-status__detail">{detail}</p> : null}
    </div>
  );
};

export { DashboardStatus };

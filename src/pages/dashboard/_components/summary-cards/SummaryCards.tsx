import type { FC } from 'react';

import { BIRTH_YEAR, CRELAN_RATE } from '@config/investment.config';
import SummaryCard from '@/components/atoms/summary-card/SummaryCard';
import { useInvestment } from '@/contexts/InvestmentContext';
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/utils/format.util';
import { getLastRow, getTotalCosts } from '@/utils/investmentCalculation.util';

const SummaryCards: FC = () => {
  const { combinedData } = useInvestment();
  const { rowIndexAtTarget, settings } = useSettings();
  const rowTarget = combinedData[rowIndexAtTarget];
  const rowEnd = getLastRow(combinedData);

  if (!rowTarget || !rowEnd) {
    return null;
  }

  const profitPercent = rowEnd.profitPercent;
  const targetYear = BIRTH_YEAR + settings.targetAge;
  const endYear = settings.endYear;

  const totalCostsEnd = getTotalCosts(rowEnd);

  return (
    <div className="summary-cards">
      <SummaryCard
        label={`Eindstand ${targetYear} (${settings.targetAge} jaar)`}
        value={formatCurrency(rowTarget.totalNetValue)}
        sub={`Bolero: ${formatCurrency(rowTarget.positionsNetValue)} · Crelan: ${formatCurrency(rowTarget.plansNetValue)} · Pensioensparen: ${formatCurrency(rowTarget.pensionNetValue)} · Cash: ${formatCurrency(rowTarget.cashReserve)}`}
        variant="blue"
      />
      <SummaryCard
        label={`Eindstand ${endYear} (${rowEnd.age} jaar)`}
        value={formatCurrency(rowEnd.totalNetValue)}
        sub={`Bolero: ${formatCurrency(rowEnd.positionsNetValue)} · Crelan: ${formatCurrency(rowEnd.plansNetValue)} · Pensioensparen: ${formatCurrency(rowEnd.pensionNetValue)} · Cash: ${formatCurrency(rowEnd.cashReserve)}`}
        variant="orange"
      />
      <SummaryCard
        label={`Rente-winst op ${rowEnd.age} jaar`}
        value={`+${formatCurrency(rowEnd.investmentInterest + (rowEnd.pensionValue - rowEnd.pensionInvested))}`}
        sub={`+${profitPercent}% op ingelegd · kosten & belasting: -${formatCurrency(totalCostsEnd)}`}
        variant="green"
      />
      <SummaryCard
        label={`Pensioensparen op ${rowEnd.age} jaar`}
        value={formatCurrency(rowEnd.pensionNetValue)}
        sub={`Bruto: ${formatCurrency(rowEnd.pensionValue)} · Na ${(settings.pensionRecaptureRate * 100).toFixed(0)}% terugvordering · Crelan ${(CRELAN_RATE * 100).toFixed(2)}%/jaar, Baloise ${(settings.baloiseRate * 100).toFixed(1)}%/jaar`}
        variant="purple"
      />
    </div>
  );
};

export { SummaryCards };

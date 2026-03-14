import { useInvestment } from '../../contexts/InvestmentContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from '../../utils/format.util';
import { getLastRow } from '../../utils/investmentCalculation.util';
import { SummaryCard } from '../atoms/SummaryCard';

export function SummaryCards() {
  const { combinedData } = useInvestment();
  const { rowIndexAtTarget, settings } = useSettings();
  const rowTarget = combinedData[rowIndexAtTarget];
  const rowEnd = getLastRow(combinedData);

  if (!rowTarget || !rowEnd) return null;

  const profitPercent = rowEnd.profitPercent;
  const targetYear = settings.startYear + rowIndexAtTarget;
  const endYear = settings.endYear;

  return (
    <div className="summary-cards">
      <SummaryCard
        label={`Eindstand ${targetYear} (${settings.targetAge} jaar)`}
        value={formatCurrency(rowTarget.totalValue)}
        sub={`Ingelegd: ${formatCurrency(rowTarget.investmentInvested + rowTarget.pensionInvested)}`}
        variant="blue"
      />
      <SummaryCard
        label={`Eindstand ${endYear} (${rowEnd.age} jaar)`}
        value={formatCurrency(rowEnd.totalValue)}
        sub={`Ingelegd: ${formatCurrency(rowEnd.investmentInvested + rowEnd.pensionInvested)}`}
        variant="orange"
      />
      <SummaryCard
        label={`Rente-winst op ${rowEnd.age} jaar`}
        value={`+${formatCurrency(rowEnd.investmentInterest + (rowEnd.pensionValue - rowEnd.pensionInvested))}`}
        sub={`+${profitPercent}% op totaal ingelegd`}
        variant="green"
      />
      <SummaryCard
        label={`Pensioensparen op ${rowEnd.age} jaar`}
        value={formatCurrency(rowEnd.pensionValue)}
        sub={`Crelan ${(settings.crelanRate * 100).toFixed(1)}%, Baloise ${(settings.baloiseRate * 100).toFixed(1)}%`}
        variant="purple"
      />
    </div>
  );
}

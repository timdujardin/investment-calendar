import { useInvestment } from '../../contexts/InvestmentContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from '../../utils/format.util';
import { getLastRow } from '../../utils/investmentCalculation.util';
import { SummaryCard } from '../atoms/SummaryCard';
import { BIRTH_YEAR } from '../../../config/investment.config';

export function SummaryCards() {
  const { combinedData } = useInvestment();
  const { rowIndexAtTarget, settings } = useSettings();
  const rowTarget = combinedData[rowIndexAtTarget];
  const rowEnd = getLastRow(combinedData);

  if (!rowTarget || !rowEnd) return null;

  const profitPercent = rowEnd.profitPercent;
  const targetYear = BIRTH_YEAR + settings.targetAge;
  const endYear = settings.endYear;

  const totalCostsEnd =
    rowEnd.investmentTransactionCosts +
    rowEnd.investmentCapitalGainsTax +
    rowEnd.pensionRecapture;

  return (
    <div className="summary-cards">
      <SummaryCard
        label={`Eindstand ${targetYear} (${settings.targetAge} jaar)`}
        value={formatCurrency(rowTarget.totalNetValue)}
        sub={`Bruto: ${formatCurrency(rowTarget.totalValue)} · Ingelegd: ${formatCurrency(rowTarget.investmentInvested + rowTarget.pensionInvested)} · Winst: +${formatCurrency(rowTarget.investmentInterest + (rowTarget.pensionValue - rowTarget.pensionInvested))} · Cash reserve: ${formatCurrency(rowTarget.cashReserve)}`}
        variant="blue"
      />
      <SummaryCard
        label={`Eindstand ${endYear} (${rowEnd.age} jaar)`}
        value={formatCurrency(rowEnd.totalNetValue)}
        sub={`Bruto: ${formatCurrency(rowEnd.totalValue)} · Ingelegd: ${formatCurrency(rowEnd.investmentInvested + rowEnd.pensionInvested)} · Winst: +${formatCurrency(rowEnd.investmentInterest + (rowEnd.pensionValue - rowEnd.pensionInvested))} · Cash reserve: ${formatCurrency(rowEnd.cashReserve)}`}
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
        sub={`Bruto: ${formatCurrency(rowEnd.pensionValue)} · Na ${(settings.pensionRecaptureRate * 100).toFixed(0)}% terugvordering · Crelan ${(settings.crelanRate * 100).toFixed(1)}%/jaar, Baloise ${(settings.baloiseRate * 100).toFixed(1)}%/jaar`}
        variant="purple"
      />
    </div>
  );
}

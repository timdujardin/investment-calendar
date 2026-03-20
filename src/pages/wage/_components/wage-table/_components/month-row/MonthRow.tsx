import type { FC } from 'react';

import { MONTH_LABELS } from '@config/wage.config';
import { formatCurrency } from '@/utils/format.util';
import { formatPercent } from '@/utils/wage.util';

import type { MonthRowProps } from '../../wage-table.types';
import { formatWageCell } from '../../wage-table.util';

const MonthRow: FC<MonthRowProps> = ({ entry }) => {
  const muted = !entry.included;
  const empty = entry.gross === null && entry.net === null;

  return (
    <tr className={muted ? 'wage-table__row--muted' : ''}>
      <td>{MONTH_LABELS[entry.month]}</td>
      <td className="wage-table__cell--number">{formatWageCell(empty, entry.gross)}</td>
      <td className="wage-table__cell--number">{formatWageCell(empty, entry.net)}</td>
      <td className="wage-table__cell--number">{entry.ratio !== null ? `${(entry.ratio * 100).toFixed(1)}%` : '—'}</td>
      <td className="wage-table__cell--number">{entry.raise !== null ? formatPercent(entry.raise) : ''}</td>
      <td className="wage-table__cell--number">{entry.premium !== null ? formatCurrency(entry.premium) : ''}</td>
      <td>{entry.company}</td>
      <td>{entry.jobTitle || '—'}</td>
      <td className="wage-table__cell--note">{entry.note ?? ''}</td>
    </tr>
  );
};

export { MonthRow };

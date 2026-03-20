import type { FC } from 'react';

import { MONTH_LABELS } from '@config/bumba.config';
import { formatPercent } from '@/utils/bumba.util';
import { formatCurrency } from '@/utils/format.util';

import type { MonthRowProps } from '../../bumba-table.types';
import { formatBumbaCell } from '../../bumba-table.util';

const MonthRow: FC<MonthRowProps> = ({ entry }) => {
  const muted = !entry.included;
  const empty = entry.gross === null && entry.net === null;

  return (
    <tr className={muted ? 'bumba-table__row--muted' : ''}>
      <td>{MONTH_LABELS[entry.month]}</td>
      <td className="bumba-table__cell--number">{formatBumbaCell(empty, entry.gross)}</td>
      <td className="bumba-table__cell--number">{formatBumbaCell(empty, entry.net)}</td>
      <td className="bumba-table__cell--number">{entry.ratio !== null ? `${(entry.ratio * 100).toFixed(1)}%` : '—'}</td>
      <td className="bumba-table__cell--number">{entry.raise !== null ? formatPercent(entry.raise) : ''}</td>
      <td className="bumba-table__cell--number">{entry.premium !== null ? formatCurrency(entry.premium) : ''}</td>
      <td>{entry.company}</td>
      <td>{entry.jobTitle || '—'}</td>
      <td className="bumba-table__cell--note">{entry.note ?? ''}</td>
    </tr>
  );
};

export { MonthRow };

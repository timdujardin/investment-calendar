import { memo, type FC } from 'react';

import { summaryCardValue, type SummaryCardValueVariants } from './SummaryCard.styles';

interface SummaryCardProps extends SummaryCardValueVariants {
  label: string;
  value: string;
  sub?: string;
}

const SummaryCard: FC<SummaryCardProps> = ({ label, value, sub, variant }) => {
  return (
    <div className="summary-card">
      <div className="summary-card__label">{label}</div>
      <div className={summaryCardValue({ variant })}>{value}</div>
      {sub ? (
        <div className="summary-card__sub">
          {sub.split('·').map((part, i) => (
            <span key={i} className="summary-card__sub-line">
              {part.trim()}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default memo(SummaryCard);

import { memo, type FC } from 'react';

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'blue' | 'green' | 'purple' | 'orange';
}

const SummaryCard: FC<SummaryCardProps> = ({ label, value, sub, variant = 'blue' }) => {
  return (
    <div className="summary-card">
      <div className="summary-card__label">{label}</div>
      <div className={`summary-card__value summary-card__value--${variant}`}>{value}</div>
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

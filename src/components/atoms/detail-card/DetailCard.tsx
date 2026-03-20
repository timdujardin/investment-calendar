import { memo, type FC, type ReactNode } from 'react';

interface DetailCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  highlight?: boolean;
  badge?: ReactNode;
  valueClassName?: string;
  children?: ReactNode;
}

const DetailCard: FC<DetailCardProps> = ({ label, value, sub, highlight, badge, valueClassName, children }) => {
  const cardClass = highlight ? 'detail-card detail-card--highlight' : 'detail-card';
  const valueClass = valueClassName ? `detail-card__value ${valueClassName}` : 'detail-card__value';

  return (
    <div className={cardClass}>
      <span className="detail-card__label">{label}</span>
      <span className={valueClass}>{value}</span>
      {sub ? <span className="detail-card__sub">{sub}</span> : null}
      {badge}
      {children}
    </div>
  );
};

export default memo(DetailCard);

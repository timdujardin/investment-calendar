import { memo, type FC, type ReactNode } from 'react';

import { detailCard, detailCardValue, type DetailCardVariants } from './DetailCard.styles';

interface DetailCardProps extends DetailCardVariants {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  badge?: ReactNode;
  valueClassName?: string;
  children?: ReactNode;
}

const DetailCard: FC<DetailCardProps> = ({ label, value, sub, highlight, badge, valueClassName, children }) => {
  return (
    <div className={detailCard({ highlight })}>
      <span className="detail-card__label">{label}</span>
      <span className={valueClassName ? `${detailCardValue()} ${valueClassName}` : detailCardValue()}>{value}</span>
      {sub ? <span className="detail-card__sub">{sub}</span> : null}
      {badge}
      {children}
    </div>
  );
};

export default memo(DetailCard);

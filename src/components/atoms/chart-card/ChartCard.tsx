import { memo, type FC, type ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  height?: number;
  disclaimer?: string;
  footer?: ReactNode;
  children: ReactNode;
}

const ChartCard: FC<ChartCardProps> = ({ title, height = 280, disclaimer, footer, children }) => {
  return (
    <div className="chart-wrap">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
      {footer}
      {disclaimer ? <p className="chart-disclaimer">{disclaimer}</p> : null}
    </div>
  );
};

export default memo(ChartCard);

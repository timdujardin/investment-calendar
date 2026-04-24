import { memo, type FC, type ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  height?: number;
  disclaimer?: string;
  footer?: ReactNode;
  /** Renders between title and chart (e.g. summary stats). */
  beforeChart?: ReactNode;
  /**
   * `false` = geen Recharts `ResponsiveContainer` (bv. statische inhoud i.p.v. grafiek).
   * @default true
   */
  useResponsiveChart?: boolean;
  children: ReactNode;
}

const ChartCard: FC<ChartCardProps> = ({
  title,
  height = 280,
  disclaimer,
  footer,
  beforeChart,
  useResponsiveChart = true,
  children,
}) => {
  return (
    <div className="chart-wrap">
      <div className="chart-title">{title}</div>
      {beforeChart}
      {useResponsiveChart ? (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="chart-wrap__static" style={{ minBlockSize: height }}>
          {children}
        </div>
      )}
      {footer}
      {disclaimer ? <p className="chart-disclaimer">{disclaimer}</p> : null}
    </div>
  );
};

export default memo(ChartCard);

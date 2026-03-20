import { memo, type FC } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
    </header>
  );
};

export default memo(PageHeader);

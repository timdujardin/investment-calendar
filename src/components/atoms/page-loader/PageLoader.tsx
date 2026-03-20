import type { FC } from 'react';

const PageLoader: FC = () => {
  return (
    <div className="page-loader" role="status" aria-label="Pagina laden">
      <div className="page-loader__spinner" />
    </div>
  );
};

export { PageLoader };

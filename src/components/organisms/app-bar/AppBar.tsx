import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/atoms/theme-toggle/ThemeToggle';

const AppBar: FC = () => {
  return (
    <header className="app-bar" role="banner">
      <Link to="/" className="app-bar__title">
        Investment calendar
      </Link>
      <div className="app-bar__actions">
        <Link to="/instellingen" className="app-bar__settings" aria-label="Instellingen">
          ⚙️
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export { AppBar };

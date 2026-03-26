import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from './bottom-nav.constants';
import { bottomNavItem } from './BottomNav.styles';

const BottomNav: FC = () => {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Hoofdnavigatie">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => bottomNavItem({ active: isActive })} end={to === '/'}>
          <span className="bottom-nav__icon">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export { BottomNav };

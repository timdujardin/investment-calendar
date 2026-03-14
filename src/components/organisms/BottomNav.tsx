import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/maand', label: 'Maand', icon: '📅' },
  { to: '/investeringen', label: 'Invest.', icon: '📈' },
  { to: '/pensioen', label: 'Pensioen', icon: '🏦' },
  { to: '/instellingen', label: 'Instell.', icon: '⚙️' },
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Hoofdnavigatie">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
          end={to === '/'}
        >
          <span className="bottom-nav__icon">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

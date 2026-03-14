import { Link } from 'react-router-dom';
import { ThemeToggle } from '../atoms/ThemeToggle';

export function AppBar() {
  return (
    <header className="app-bar" role="banner">
      <Link to="/" className="app-bar__title">
        Investment calendar
      </Link>
      <ThemeToggle />
    </header>
  );
}

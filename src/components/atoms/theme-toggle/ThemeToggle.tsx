import type { FC } from 'react';

import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      <span className="theme-toggle__icon" aria-hidden>
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export { ThemeToggle };

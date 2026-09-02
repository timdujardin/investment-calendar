import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FC,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'investment-calendar-theme';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Expliciete keuze van de gebruiker, of `null` zolang die de systeemvoorkeur volgt. */
const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(STORAGE_KEY);

  return stored === 'light' || stored === 'dark' ? stored : null;
};

const subscribeToColorScheme = (onChange: () => void): (() => void) => {
  const media = window.matchMedia(COLOR_SCHEME_QUERY);
  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
};

const getSystemTheme = (): Theme => (window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light');

/** Er is geen server-render; dit is enkel de waarde die `useSyncExternalStore` verplicht stelt. */
const getServerTheme = (): Theme => 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  /**
   * De systeemvoorkeur is een externe bron die buiten React om verandert, dus die komt via
   * `useSyncExternalStore` binnen in plaats van via een Effect dat state bijhoudt.
   */
  const systemTheme = useSyncExternalStore(subscribeToColorScheme, getSystemTheme, getServerTheme);
  const [storedTheme, setStoredTheme] = useState<Theme | null>(getStoredTheme);

  const theme = storedTheme ?? systemTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0f172a' : '#1e3a5f');
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setStoredTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return ctx;
};

export { ThemeProvider, useTheme };

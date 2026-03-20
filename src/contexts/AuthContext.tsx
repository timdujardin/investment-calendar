import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import { verifyCredentials } from '@/utils/auth.util';

const STORAGE_KEY = 'investment-calendar-auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const hasStoredSession = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const session = JSON.parse(raw);

    return session?.authenticated === true;
  } catch {
    return false;
  }
};

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(hasStoredSession);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const valid = await verifyCredentials(username, password);
    if (!valid) {
      return false;
    }

    const session = { authenticated: true, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setIsAuthenticated(true);

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};

export { AuthProvider, useAuth };

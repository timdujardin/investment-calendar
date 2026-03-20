import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

import { ENCRYPTED_WAGE_DATA, ENCRYPTION_IV, ENCRYPTION_SALT } from '@config/wage-data.config';
import type { WageEntry } from '@/@types/wage';
import { verifyCredentials } from '@/utils/auth.util';
import { decryptWithKey, deriveAndExportKey, importKey } from '@/utils/crypto.util';

const SESSION_KEY = 'investment-calendar-auth';
const CRYPTO_KEY = 'investment-calendar-crypto-key';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  wageData: WageEntry[] | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const decryptWageData = async (aesKey: CryptoKey): Promise<WageEntry[]> => {
  const json = await decryptWithKey(ENCRYPTED_WAGE_DATA, ENCRYPTION_IV, aesKey);

  return JSON.parse(json) as WageEntry[];
};

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wageData, setWageData] = useState<WageEntry[] | null>(null);

  useEffect(() => {
    const restore = async () => {
      try {
        const session = localStorage.getItem(SESSION_KEY);
        const storedKey = localStorage.getItem(CRYPTO_KEY);
        if (!session || !storedKey) {
          return;
        }

        const parsed = JSON.parse(session);
        if (parsed?.authenticated !== true) {
          return;
        }

        const aesKey = await importKey(storedKey);
        const data = await decryptWageData(aesKey);

        setWageData(data);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(CRYPTO_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    restore();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const valid = await verifyCredentials(username, password);
    if (!valid) {
      return false;
    }

    const { key, raw } = await deriveAndExportKey(password, ENCRYPTION_SALT);
    const data = await decryptWageData(key);

    localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, timestamp: Date.now() }));
    localStorage.setItem(CRYPTO_KEY, raw);
    setWageData(data);
    setIsAuthenticated(true);

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CRYPTO_KEY);
    setWageData(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, wageData, login, logout }),
    [isAuthenticated, isLoading, wageData, login, logout],
  );

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

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

import { ENCRYPTED_BUMBA_DATA, ENCRYPTION_IV, ENCRYPTION_SALT } from '@config/wage-data.config';
import type { BumbaEntry } from '@/@types/bumba';
import { verifyCredentials } from '@/utils/auth.util';
import { decryptWithKey, deriveAndExportKey, importKey } from '@/utils/crypto.util';

const SESSION_KEY = 'investment-calendar-auth';
const CRYPTO_KEY = 'investment-calendar-crypto-key';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  bumbaData: BumbaEntry[] | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const decryptBumbaData = async (aesKey: CryptoKey): Promise<BumbaEntry[]> => {
  const json = await decryptWithKey(ENCRYPTED_BUMBA_DATA, ENCRYPTION_IV, aesKey);

  return JSON.parse(json) as BumbaEntry[];
};

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bumbaData, setBumbaData] = useState<BumbaEntry[] | null>(null);

  useEffect(() => {
    const restore = async () => {
      try {
        localStorage.removeItem(CRYPTO_KEY);

        const session = localStorage.getItem(SESSION_KEY);
        const storedKey = sessionStorage.getItem(CRYPTO_KEY);
        if (!session || !storedKey) {
          return;
        }

        const parsed = JSON.parse(session);
        if (parsed?.authenticated !== true) {
          return;
        }

        const elapsed = Date.now() - (parsed.timestamp ?? 0);
        if (elapsed > SESSION_MAX_AGE_MS) {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(CRYPTO_KEY);
          return;
        }

        const aesKey = await importKey(storedKey);
        const data = await decryptBumbaData(aesKey);

        setBumbaData(data);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(CRYPTO_KEY);
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
    const data = await decryptBumbaData(key);

    localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, timestamp: Date.now() }));
    sessionStorage.setItem(CRYPTO_KEY, raw);
    setBumbaData(data);
    setIsAuthenticated(true);

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CRYPTO_KEY);
    setBumbaData(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, bumbaData, login, logout }),
    [isAuthenticated, isLoading, bumbaData, login, logout],
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

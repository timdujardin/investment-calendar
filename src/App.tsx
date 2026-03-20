import { lazy, Suspense, type FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { PageLoader } from '@/components/atoms/page-loader/PageLoader';
import { AppBar } from '@/components/organisms/app-bar/AppBar';
import { BottomNav } from '@/components/organisms/bottom-nav/BottomNav';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { InvestmentProvider } from '@/contexts/InvestmentContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginPage } from '@/pages/login/LoginPage';

import './App.css';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MonthlySavingsPage = lazy(() =>
  import('@/pages/monthly-savings/MonthlySavingsPage').then((m) => ({ default: m.MonthlySavingsPage })),
);
const InvestmentsPage = lazy(() =>
  import('@/pages/investments/InvestmentsPage').then((m) => ({ default: m.InvestmentsPage })),
);
const PensionPage = lazy(() => import('@/pages/pension/PensionPage').then((m) => ({ default: m.PensionPage })));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const WagePage = lazy(() => import('@/pages/wage/WagePage').then((m) => ({ default: m.WagePage })));

const AuthenticatedApp: FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SettingsProvider>
        <InvestmentProvider>
          <div className="app">
            <AppBar />
            <div className="app__content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/maand" element={<MonthlySavingsPage />} />
                  <Route path="/investeringen" element={<InvestmentsPage />} />
                  <Route path="/pensioen" element={<PensionPage />} />
                  <Route path="/instellingen" element={<SettingsPage />} />
                  <Route path="/loon" element={<WagePage />} />
                </Routes>
              </Suspense>
            </div>
            <BottomNav />
          </div>
        </InvestmentProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

const AppGate: FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AuthenticatedApp /> : <LoginPage />;
};

const App: FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppGate />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;

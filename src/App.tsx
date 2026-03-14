import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { InvestmentProvider } from './contexts/InvestmentContext';
import { AppBar } from './components/organisms/AppBar';
import { BottomNav } from './components/organisms/BottomNav';
import './App.css';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const MonthlySavingsPage = lazy(() =>
  import('./pages/MonthlySavingsPage').then((m) => ({ default: m.MonthlySavingsPage }))
);
const InvestmentsPage = lazy(() =>
  import('./pages/InvestmentsPage').then((m) => ({ default: m.InvestmentsPage }))
);
const PensionPage = lazy(() =>
  import('./pages/PensionPage').then((m) => ({ default: m.PensionPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Pagina laden">
      <div className="page-loader__spinner" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
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
                  </Routes>
                </Suspense>
              </div>
              <BottomNav />
            </div>
          </InvestmentProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

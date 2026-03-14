import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency } from '../../utils/format.util';

export function AppHeader() {
  const { settings } = useSettings();

  return (
    <header className="app-header">
      <h1 className="app-header__title">
        💰 Investment calendar {settings.startYear}–{settings.endYear}
      </h1>
      <p className="app-header__subtitle">
        Gecombineerd overzicht van investering en pensioensparen tot {settings.endYear - 1994} jaar
      </p>
      <div className="app-header__pills">
        <span className="pill">
          📈 Investering: €{settings.investmentMonthlyFirstYear}/mnd ({settings.startYear}) · €{settings.investmentMonthly}/mnd (vanaf {settings.startYear + 1})
        </span>
        <span className="pill">
          🏦 Pensioensparen: Crelan {(settings.crelanRate * 100).toFixed(1)}% + Baloise {(settings.baloiseRate * 100).toFixed(1)}%
        </span>
        <span className="pill">
          🎯 Doel: {formatCurrency(settings.targetAmount)} tegen {settings.targetAge} jaar · {settings.rate}% rendement
        </span>
      </div>
    </header>
  );
}

import { useSettings, type AppSettings } from '../contexts/SettingsContext';
import type { InvestmentRate } from '../types/investment';
import { formatCurrency } from '../utils/format.util';

const RATE_OPTIONS: InvestmentRate[] = [5, 7, 10];

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  function handleNumber(key: keyof AppSettings, value: string) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      updateSettings({ [key]: parsed });
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-header__title">⚙️ Instellingen</h1>
        <p className="page-header__subtitle">
          Pas je beleggings- en pensioeninstellingen aan
        </p>
      </header>

      <main className="page__main">
        <section className="settings-section">
          <h2 className="settings-section__title">Rendement</h2>
          <div className="settings-field">
            <label className="settings-field__label">Winstpercentage</label>
            <div className="settings-rate-group" role="radiogroup" aria-label="Winstpercentage">
              {RATE_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`settings-rate-group__btn ${settings.rate === r ? 'settings-rate-group__btn--active' : ''}`}
                  onClick={() => updateSettings({ rate: r })}
                  aria-checked={settings.rate === r}
                  role="radio"
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Pensioenspaarfondsen</h2>
          <div className="settings-field-row">
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="crelan-rate">
                Crelan rendement
              </label>
              <div className="settings-field__input-wrap">
                <input
                  id="crelan-rate"
                  className="settings-field__input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.25"
                  value={Math.round(settings.crelanRate * 10000) / 100}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) updateSettings({ crelanRate: parsed / 100 });
                  }}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="baloise-rate">
                Baloise rendement
              </label>
              <div className="settings-field__input-wrap">
                <input
                  id="baloise-rate"
                  className="settings-field__input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.25"
                  value={Math.round(settings.baloiseRate * 10000) / 100}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) updateSettings({ baloiseRate: parsed / 100 });
                  }}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
          </div>
          <span className="settings-field__hint">
            Crelan {(settings.crelanRate * 100).toFixed(1)}%/jaar + Baloise {(settings.baloiseRate * 100).toFixed(1)}%/jaar
          </span>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Kosten & belasting</h2>
          <div className="settings-field-row settings-field-row--3col">
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="pension-recapture">
                Pensioen terugvordering
              </label>
              <div className="settings-field__input-wrap">
                <input
                  id="pension-recapture"
                  className="settings-field__input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  value={Math.round(settings.pensionRecaptureRate * 10000) / 100}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) updateSettings({ pensionRecaptureRate: parsed / 100 });
                  }}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="transaction-fee">
                Beurstaks + makelaar
              </label>
              <div className="settings-field__input-wrap">
                <input
                  id="transaction-fee"
                  className="settings-field__input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  value={Math.round(settings.transactionFeeRate * 10000) / 100}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) updateSettings({ transactionFeeRate: parsed / 100 });
                  }}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="capital-gains-tax">
                Meerwaardetaks
              </label>
              <div className="settings-field__input-wrap">
                <input
                  id="capital-gains-tax"
                  className="settings-field__input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  value={Math.round(settings.capitalGainsTaxRate * 10000) / 100}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed)) updateSettings({ capitalGainsTaxRate: parsed / 100 });
                  }}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
          </div>
          <span className="settings-field__hint">
            Pensioen: terugvordering bij pensionering · Beurstaks: kosten bij storting · Meerwaarde: per €10.000 winst
          </span>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Doelstelling</h2>
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="target-amount">
              Doelbedrag
            </label>
            <div className="settings-field__input-wrap">
              <span className="settings-field__prefix">€</span>
              <input
                id="target-amount"
                className="settings-field__input"
                type="number"
                inputMode="numeric"
                min="0"
                step="1000"
                value={settings.targetAmount}
                onChange={(e) => handleNumber('targetAmount', e.target.value)}
              />
            </div>
            <span className="settings-field__hint">
              Huidige doel: {formatCurrency(settings.targetAmount)} tegen {settings.targetAge} jaar
            </span>
          </div>
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="target-age">
              Doelleeftijd
            </label>
            <div className="settings-field__input-wrap">
              <input
                id="target-age"
                className="settings-field__input"
                type="number"
                inputMode="numeric"
                min="30"
                max="70"
                value={settings.targetAge}
                onChange={(e) => handleNumber('targetAge', e.target.value)}
              />
              <span className="settings-field__suffix">jaar</span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Periode</h2>
          <div className="settings-field-row">
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="start-year">
                Startjaar
              </label>
              <input
                id="start-year"
                className="settings-field__input"
                type="number"
                inputMode="numeric"
                min="2020"
                max="2060"
                value={settings.startYear}
                onChange={(e) => handleNumber('startYear', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="end-year">
                Eindjaar
              </label>
              <input
                id="end-year"
                className="settings-field__input"
                type="number"
                inputMode="numeric"
                min="2030"
                max="2080"
                value={settings.endYear}
                onChange={(e) => handleNumber('endYear', e.target.value)}
              />
            </div>
          </div>
          <span className="settings-field__hint">
            Projectie: {settings.endYear - settings.startYear} jaar ({settings.startYear}–{settings.endYear})
          </span>
        </section>

        <section className="settings-section">
          <h2 className="settings-section__title">Vermogen</h2>
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="current-invested">
              Huidig geïnvesteerd bedrag
            </label>
            <div className="settings-field__input-wrap">
              <span className="settings-field__prefix">€</span>
              <input
                id="current-invested"
                className="settings-field__input"
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                value={settings.currentInvestedAmount}
                onChange={(e) => handleNumber('currentInvestedAmount', e.target.value)}
              />
            </div>
            <span className="settings-field__hint">
              Startwaarde portefeuille bij aanvang projectie
            </span>
          </div>
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="cash-reserve">
              Cash reserve
            </label>
            <div className="settings-field__input-wrap">
              <span className="settings-field__prefix">€</span>
              <input
                id="cash-reserve"
                className="settings-field__input"
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                value={settings.cashReserve}
                onChange={(e) => handleNumber('cashReserve', e.target.value)}
              />
            </div>
            <span className="settings-field__hint">
              Vast bedrag zonder rendement, telt mee bij totalen
            </span>
          </div>

          <h2 className="settings-section__title">Maandelijkse investering</h2>
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="monthly-first">
              Eerste jaar ({settings.startYear})
            </label>
            <div className="settings-field__input-wrap">
              <span className="settings-field__prefix">€</span>
              <input
                id="monthly-first"
                className="settings-field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="25"
                value={settings.investmentMonthlyFirstYear}
                onChange={(e) => handleNumber('investmentMonthlyFirstYear', e.target.value)}
              />
              <span className="settings-field__suffix">/mnd</span>
            </div>
          </div>
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="monthly-after">
              Vanaf {settings.startYear + 1}
            </label>
            <div className="settings-field__input-wrap">
              <span className="settings-field__prefix">€</span>
              <input
                id="monthly-after"
                className="settings-field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="25"
                value={settings.investmentMonthly}
                onChange={(e) => handleNumber('investmentMonthly', e.target.value)}
              />
              <span className="settings-field__suffix">/mnd</span>
            </div>
          </div>
        </section>

        <div className="settings-actions">
          <button
            type="button"
            className="settings-actions__reset"
            onClick={resetSettings}
          >
            Standaard herstellen
          </button>
        </div>
      </main>
    </div>
  );
}

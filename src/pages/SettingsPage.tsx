import { useState, useEffect, type InputHTMLAttributes } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { InvestmentRate } from '../types/investment';
import { formatCurrency } from '../utils/format.util';

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  numericValue: number;
  onCommit: (value: number) => void;
  toDisplay?: (n: number) => number;
  fromDisplay?: (n: number) => number;
}

function NumericInput({ numericValue, onCommit, toDisplay, fromDisplay, ...rest }: NumericInputProps) {
  const display = toDisplay ? toDisplay(numericValue) : numericValue;
  const [raw, setRaw] = useState(String(display));

  useEffect(() => {
    setRaw(String(toDisplay ? toDisplay(numericValue) : numericValue));
  }, [numericValue, toDisplay]);

  return (
    <input
      {...rest}
      type="number"
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        const parsed = parseFloat(e.target.value);
        if (!isNaN(parsed)) {
          onCommit(fromDisplay ? fromDisplay(parsed) : parsed);
        }
      }}
      onBlur={() => {
        const parsed = parseFloat(raw);
        if (isNaN(parsed) || raw === '') {
          setRaw(String(display));
        }
      }}
    />
  );
}

const RATE_OPTIONS: InvestmentRate[] = [5, 7, 10];

const toPercent = (n: number) => Math.round(n * 10000) / 100;
const fromPercent = (n: number) => n / 100;

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

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
                <NumericInput
                  id="crelan-rate"
                  className="settings-field__input"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.25"
                  numericValue={settings.crelanRate}
                  toDisplay={toPercent}
                  fromDisplay={fromPercent}
                  onCommit={(v) => updateSettings({ crelanRate: v })}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="baloise-rate">
                Baloise rendement
              </label>
              <div className="settings-field__input-wrap">
                <NumericInput
                  id="baloise-rate"
                  className="settings-field__input"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.25"
                  numericValue={settings.baloiseRate}
                  toDisplay={toPercent}
                  fromDisplay={fromPercent}
                  onCommit={(v) => updateSettings({ baloiseRate: v })}
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
                <NumericInput
                  id="pension-recapture"
                  className="settings-field__input"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  numericValue={settings.pensionRecaptureRate}
                  toDisplay={toPercent}
                  fromDisplay={fromPercent}
                  onCommit={(v) => updateSettings({ pensionRecaptureRate: v })}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="transaction-fee">
                Beurstaks + makelaar
              </label>
              <div className="settings-field__input-wrap">
                <NumericInput
                  id="transaction-fee"
                  className="settings-field__input"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  numericValue={settings.transactionFeeRate}
                  toDisplay={toPercent}
                  fromDisplay={fromPercent}
                  onCommit={(v) => updateSettings({ transactionFeeRate: v })}
                />
                <span className="settings-field__suffix">%</span>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="capital-gains-tax">
                Meerwaardetaks
              </label>
              <div className="settings-field__input-wrap">
                <NumericInput
                  id="capital-gains-tax"
                  className="settings-field__input"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.5"
                  numericValue={settings.capitalGainsTaxRate}
                  toDisplay={toPercent}
                  fromDisplay={fromPercent}
                  onCommit={(v) => updateSettings({ capitalGainsTaxRate: v })}
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
              <NumericInput
                id="target-amount"
                className="settings-field__input"
                inputMode="numeric"
                min="0"
                step="1000"
                numericValue={settings.targetAmount}
                onCommit={(v) => updateSettings({ targetAmount: v })}
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
              <NumericInput
                id="target-age"
                className="settings-field__input"
                inputMode="numeric"
                min="30"
                max="70"
                numericValue={settings.targetAge}
                onCommit={(v) => updateSettings({ targetAge: v })}
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
              <NumericInput
                id="start-year"
                className="settings-field__input"
                inputMode="numeric"
                min="2020"
                max="2060"
                numericValue={settings.startYear}
                onCommit={(v) => updateSettings({ startYear: v })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="end-year">
                Eindjaar
              </label>
              <NumericInput
                id="end-year"
                className="settings-field__input"
                inputMode="numeric"
                min="2030"
                max="2080"
                numericValue={settings.endYear}
                onCommit={(v) => updateSettings({ endYear: v })}
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
              <NumericInput
                id="current-invested"
                className="settings-field__input"
                inputMode="numeric"
                min="0"
                step="500"
                numericValue={settings.currentInvestedAmount}
                onCommit={(v) => updateSettings({ currentInvestedAmount: v })}
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
              <NumericInput
                id="cash-reserve"
                className="settings-field__input"
                inputMode="numeric"
                min="0"
                step="500"
                numericValue={settings.cashReserve}
                onCommit={(v) => updateSettings({ cashReserve: v })}
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
              <NumericInput
                id="monthly-first"
                className="settings-field__input"
                inputMode="decimal"
                min="0"
                step="25"
                numericValue={settings.investmentMonthlyFirstYear}
                onCommit={(v) => updateSettings({ investmentMonthlyFirstYear: v })}
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
              <NumericInput
                id="monthly-after"
                className="settings-field__input"
                inputMode="decimal"
                min="0"
                step="25"
                numericValue={settings.investmentMonthly}
                onCommit={(v) => updateSettings({ investmentMonthly: v })}
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

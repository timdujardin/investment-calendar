import { useCallback, type FC } from 'react';

import { CRELAN_RATE } from '@config/investment.config';
import type { InvestmentPosition, MonthlyInvestmentPlan } from '@/@types/investment';
import PageHeader from '@/components/atoms/page-header/PageHeader';
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/utils/format.util';
import { getEffectiveMonthlyTotal, getNominalMonthlyTotal, removeAtIndex } from '@/utils/investmentCalculation.util';

import { NumericInput } from './_components/numeric-input/NumericInput';
import { fromPercent, RATE_OPTIONS, toPercent } from './settings.constants';
import { rateButton } from './SettingsPage.styles';

const SettingsPage: FC = () => {
  const { settings, positionsTotal, updateSettings, resetSettings } = useSettings();

  const nominalMonthly = getNominalMonthlyTotal(settings.monthlyPlans);
  const effectiveMonthly = getEffectiveMonthlyTotal(settings.monthlyPlans);

  const updatePosition = useCallback(
    (index: number, patch: Partial<InvestmentPosition>) => {
      const next = settings.positions.map((p, i) => (i === index ? { ...p, ...patch } : p));
      updateSettings({ positions: next });
    },
    [settings.positions, updateSettings],
  );

  const addPosition = useCallback(() => {
    updateSettings({ positions: [...settings.positions, { name: '', ticker: '', amount: 0, shares: 0 }] });
  }, [settings.positions, updateSettings]);

  const removePosition = useCallback(
    (index: number) => {
      updateSettings({ positions: removeAtIndex(settings.positions, index) });
    },
    [settings.positions, updateSettings],
  );

  const updatePlanMonthly = useCallback(
    (index: number, monthlyAmount: number) => {
      const next = settings.monthlyPlans.map(
        (p, i): MonthlyInvestmentPlan => (i === index ? { ...p, monthlyAmount } : p),
      );
      updateSettings({ monthlyPlans: next });
    },
    [settings.monthlyPlans, updateSettings],
  );

  return (
    <div className="page">
      <PageHeader title="⚙️ Instellingen" subtitle="Pas je beleggings- en pensioeninstellingen aan" />

      <main className="page__main">
        <h2 className="settings-section__title">Projectie-instellingen</h2>
        <section className="settings-section">
          <span className="settings-field__hint">
            Rendement wordt toegepast op Bolero-posities en Crelan-beleggingsplannen. Pensioensparen heeft eigen vaste
            rentetarieven.
          </span>
          <div className="settings-field">
            <label className="settings-field__label">Winstpercentage</label>
            <div className="settings-rate-group" role="radiogroup" aria-label="Winstpercentage">
              {RATE_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={rateButton({ active: settings.rate === r })}
                  onClick={() => updateSettings({ rate: r })}
                  aria-checked={settings.rate === r}
                  role="radio"
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <hr className="settings-section__divider" />

          <div className="settings-field-row">
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
          </div>
          <span className="settings-field__hint">
            Doel: {formatCurrency(settings.targetAmount)} tegen {settings.targetAge} jaar
          </span>

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

        <h2 className="settings-section__title">Bolero</h2>
        <section className="settings-section">
          <span className="settings-field__hint">Individuele posities beheerd via KBC Bolero</span>

          {settings.positions.map((pos, i) => {
            const hasDividend =
              pos.dividendPerShare != null || pos.dividendFrequencyPerYear != null || pos.dividendReceived != null;

            return (
              <div key={i} className="settings-position-group">
                <div className="settings-field-row settings-field-row--3col">
                  <div className="settings-field">
                    <label className="settings-field__label" htmlFor={`pos-name-${i}`}>
                      Naam
                    </label>
                    <input
                      id={`pos-name-${i}`}
                      className="settings-field__input"
                      type="text"
                      value={pos.name}
                      onChange={(e) => updatePosition(i, { name: e.target.value })}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field__label" htmlFor={`pos-ticker-${i}`}>
                      Ticker
                    </label>
                    <input
                      id={`pos-ticker-${i}`}
                      className="settings-field__input"
                      type="text"
                      value={pos.ticker}
                      onChange={(e) => updatePosition(i, { ticker: e.target.value })}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field__label" htmlFor={`pos-amount-${i}`}>
                      Bedrag
                    </label>
                    <div className="settings-field__input-wrap">
                      <span className="settings-field__prefix">€</span>
                      <NumericInput
                        id={`pos-amount-${i}`}
                        className="settings-field__input"
                        inputMode="numeric"
                        min="0"
                        step="500"
                        numericValue={pos.amount}
                        onCommit={(v) => updatePosition(i, { amount: v })}
                      />
                      <button
                        type="button"
                        className="settings-field__remove-btn"
                        onClick={() => removePosition(i)}
                        aria-label={`Verwijder ${pos.name || 'positie'}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <div className="settings-field-row">
                  <div className="settings-field">
                    <label className="settings-field__label" htmlFor={`pos-shares-${i}`}>
                      Aandelen
                    </label>
                    <NumericInput
                      id={`pos-shares-${i}`}
                      className="settings-field__input"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      numericValue={pos.shares}
                      onCommit={(v) => updatePosition(i, { shares: v })}
                    />
                  </div>
                </div>

                {hasDividend ? (
                  <div className="settings-field-row settings-field-row--3col">
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor={`pos-div-${i}`}>
                        Dividend/aandeel
                      </label>
                      <div className="settings-field__input-wrap">
                        <span className="settings-field__prefix">CA$</span>
                        <NumericInput
                          id={`pos-div-${i}`}
                          className="settings-field__input"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          numericValue={pos.dividendPerShare ?? 0}
                          onCommit={(v) => updatePosition(i, { dividendPerShare: v })}
                        />
                      </div>
                    </div>
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor={`pos-freq-${i}`}>
                        Uitkeringen/jaar
                      </label>
                      <NumericInput
                        id={`pos-freq-${i}`}
                        className="settings-field__input"
                        inputMode="numeric"
                        min="0"
                        max="12"
                        step="1"
                        numericValue={pos.dividendFrequencyPerYear ?? 0}
                        onCommit={(v) => updatePosition(i, { dividendFrequencyPerYear: v })}
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-field__label" htmlFor={`pos-divrecv-${i}`}>
                        Ontvangen
                      </label>
                      <div className="settings-field__input-wrap">
                        <span className="settings-field__prefix">€</span>
                        <NumericInput
                          id={`pos-divrecv-${i}`}
                          className="settings-field__input"
                          inputMode="decimal"
                          min="0"
                          step="1"
                          numericValue={pos.dividendReceived ?? 0}
                          onCommit={(v) => updatePosition(i, { dividendReceived: v })}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {!hasDividend && (
                  <div className="settings-field-row">
                    <button
                      type="button"
                      className="settings-actions__add"
                      onClick={() =>
                        updatePosition(i, { dividendPerShare: 0, dividendFrequencyPerYear: 4, dividendReceived: 0 })
                      }
                    >
                      + Dividend toevoegen
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div className="settings-field-row">
            <button type="button" className="settings-actions__add" onClick={addPosition}>
              + Positie toevoegen
            </button>
          </div>
          <span className="settings-field__hint">Totaal Bolero: {formatCurrency(positionsTotal)}</span>

          <hr className="settings-section__divider" />

          <div className="settings-field-row">
            <div className="settings-field">
              <label className="settings-field__label" htmlFor="cad-to-eur">
                Wisselkoers CAD → EUR
              </label>
              <NumericInput
                id="cad-to-eur"
                className="settings-field__input"
                inputMode="decimal"
                min="0"
                max="2"
                step="0.01"
                numericValue={settings.cadToEur}
                onCommit={(v) => updateSettings({ cadToEur: v })}
              />
              <span className="settings-field__hint">1 CAD = {settings.cadToEur} EUR — voor dividendprognose</span>
            </div>
          </div>

          <div className="settings-field-row">
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
              <span className="settings-field__hint">% op elke storting</span>
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
              <span className="settings-field__hint">% per €10.000 winst</span>
            </div>
          </div>
        </section>

        <h2 className="settings-section__title">Crelan</h2>
        <section className="settings-section">
          <span className="settings-field__hint">
            Beleggingsplannen beheerd door Crelan · Totaal: €{nominalMonthly}/mnd bruto · €{effectiveMonthly.toFixed(2)}
            /mnd effectief
          </span>

          {settings.monthlyPlans.map((plan, i) => (
            <div key={plan.isin} className="settings-plan-item">
              <div className="settings-field">
                <label className="settings-field__label">{plan.name}</label>
                <span className="settings-field__hint">ISIN: {plan.isin}</span>
              </div>
              <div className="settings-field">
                <label className="settings-field__label" htmlFor={`plan-monthly-${i}`}>
                  Maandbedrag
                </label>
                <div className="settings-field__input-wrap">
                  <span className="settings-field__prefix">€</span>
                  <NumericInput
                    id={`plan-monthly-${i}`}
                    className="settings-field__input"
                    inputMode="numeric"
                    min="0"
                    step="25"
                    numericValue={plan.monthlyAmount}
                    onCommit={(v) => updatePlanMonthly(i, v)}
                  />
                  <span className="settings-field__suffix">/mnd</span>
                </div>
                <span className="settings-field__hint">Instapkost: {(plan.entryFeeRate * 100).toFixed(1)}% (vast)</span>
              </div>
              <span className="settings-field__hint">
                Effectief €{(plan.monthlyAmount * (1 - plan.entryFeeRate)).toFixed(2)}/mnd · Uitstapkosten:{' '}
                {plan.exitFees.map((f) => `${(f.rate * 100).toFixed(2)}% na ${f.afterYears}jr`).join(', ')}
              </span>
            </div>
          ))}
        </section>

        <h2 className="settings-section__title">Pensioensparen</h2>
        <section className="settings-section">
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="pension-recapture">
              Terugvordering
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
            <span className="settings-field__hint">
              Geldt voor alle pensioenspaarbedragen (Crelan + Baloise) bij uitkering
            </span>
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
              <span className="settings-field__suffix">%/jaar</span>
            </div>
            <span className="settings-field__hint">Maandelijkse bijdrage met samengesteld rendement</span>
          </div>
          <span className="settings-field__hint">
            Crelan rendement: {(CRELAN_RATE * 100).toFixed(2)}%/jaar (vast) — eenmalige storting, groeit enkel op rente
          </span>
        </section>

        <h2 className="settings-section__title">Cash reserve</h2>
        <section className="settings-section">
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="cash-reserve">
              Bedrag
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
            <span className="settings-field__hint">Vast bedrag zonder rendement, telt mee bij totalen</span>
          </div>
        </section>

        <div className="settings-actions">
          <button type="button" className="settings-actions__reset" onClick={resetSettings}>
            Standaard herstellen
          </button>
        </div>
      </main>
    </div>
  );
};

export { SettingsPage };

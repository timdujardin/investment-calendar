import { useState } from 'react';
import { useInvestment } from '../contexts/InvestmentContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency } from '../utils/format.util';
import { YearSelector, useCurrentYearIndex } from '../components/atoms/YearSelector';

export function InvestmentsPage() {
  const { combinedData } = useInvestment();
  const { settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const row = combinedData[yearIndex];
  const prevRow = yearIndex > 0 ? combinedData[yearIndex - 1] : null;

  const yearGrowth = prevRow
    ? row.investmentValue - prevRow.investmentValue
    : row.investmentValue;

  const returnOnInvestment =
    row.investmentInvested > 0
      ? ((row.investmentInterest / row.investmentInvested) * 100).toFixed(1)
      : '0.0';

  const isTargetReached = row.totalValue >= settings.targetAmount;
  const wasTargetReachedBefore = prevRow && prevRow.totalValue >= settings.targetAmount;

  return (
    <div className="page">
      <YearSelector value={yearIndex} onChange={setYearIndex} />

      <header className="page-header">
        <h1 className="page-header__title">📈 Investeringen — {row.year}</h1>
        <p className="page-header__subtitle">
          {row.age} jaar · {settings.rate}% rendement · €{row.investmentMonthly}/mnd
        </p>
      </header>

      <main className="page__main">
        <div className="detail-grid">
          <div className="detail-card detail-card--highlight">
            <span className="detail-card__label">Portefeuille waarde</span>
            <span className="detail-card__value detail-card__value--large text-investment">
              {formatCurrency(row.investmentValue)}
            </span>
            <span className="detail-card__sub">
              Ingelegd: {formatCurrency(row.investmentInvested)} · Winst: +{formatCurrency(row.investmentInterest)} (+{returnOnInvestment}%)
            </span>
            {isTargetReached && !wasTargetReachedBefore && (
              <span className="detail-card__badge detail-card__badge--success">
                Doelbedrag {formatCurrency(settings.targetAmount)} bereikt
              </span>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Inleg & rendement</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Totaal ingelegd</span>
              <span className="detail-card__value">
                {formatCurrency(row.investmentInvested)}
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Rente-winst</span>
              <span className="detail-card__value text-interest">
                +{formatCurrency(row.investmentInterest)}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Groei</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Groei dit jaar</span>
              <span className="detail-card__value text-interest">
                +{formatCurrency(yearGrowth)}
              </span>
              {prevRow && (
                <span className="detail-card__sub">
                  Vorig jaar: {formatCurrency(prevRow.investmentValue)}
                </span>
              )}
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Rendement op inleg</span>
              <span className="detail-card__value text-interest">
                +{returnOnInvestment}%
              </span>
              <span className="detail-card__sub">
                €{row.investmentMonthly}/mnd storting
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

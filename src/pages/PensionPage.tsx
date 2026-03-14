import { useState } from 'react';
import { useInvestment } from '../contexts/InvestmentContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency } from '../utils/format.util';
import { getAgeFromYear } from '../utils/investmentCalculation.util';
import { YearSelector, useCurrentYearIndex } from '../components/atoms/YearSelector';
import {
  BALOISE_MONTHLY_2026,
  BALOISE_MONTHLY_FROM_2027,
  CRELAN_START_VALUE,
} from '../../config/investment.config';

export function PensionPage() {
  const { pensionData } = useInvestment();
  const { investmentYears, settings } = useSettings();
  const defaultIndex = useCurrentYearIndex();
  const [yearIndex, setYearIndex] = useState(defaultIndex);
  const row = pensionData[yearIndex];
  const year = investmentYears[yearIndex];
  const age = getAgeFromYear(year);
  const baloiseMonthly = yearIndex === 0 ? BALOISE_MONTHLY_2026 : BALOISE_MONTHLY_FROM_2027;

  const totalInterest = row.valueTotal - row.investedTotal;
  const returnPercent =
    row.investedTotal > 0
      ? ((totalInterest / row.investedTotal) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="page">
      <YearSelector value={yearIndex} onChange={setYearIndex} />

      <header className="page-header">
        <h1 className="page-header__title">🏦 Pensioensparen — {year}</h1>
        <p className="page-header__subtitle">
          {age} jaar · Crelan {(settings.crelanRate * 100).toFixed(1)}% + Baloise {(settings.baloiseRate * 100).toFixed(1)}%
        </p>
      </header>

      <main className="page__main">
        <div className="detail-grid">
          <div className="detail-card detail-card--highlight">
            <span className="detail-card__label">Totaal waarde</span>
            <span className="detail-card__value detail-card__value--large text-pension">
              {formatCurrency(row.valueTotal)}
            </span>
            <span className="detail-card__sub">
              Ingelegd: {formatCurrency(row.investedTotal)} · Winst: +{formatCurrency(totalInterest)} (+{returnPercent}%)
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Crelan ({(settings.crelanRate * 100).toFixed(1)}%)</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Ingelegd</span>
              <span className="detail-card__value frozen">
                {formatCurrency(row.investedCrelan)}
              </span>
              <span className="detail-card__sub">Eenmalige storting — blijft staan</span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Waarde</span>
              <span className="detail-card__value text-pension">
                {formatCurrency(row.valueCrelan)}
              </span>
              <span className="detail-card__sub">
                +{formatCurrency(row.valueCrelan - CRELAN_START_VALUE)} rente
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2 className="detail-section__title">Baloise ({(settings.baloiseRate * 100).toFixed(1)}%)</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <span className="detail-card__label">Ingelegd</span>
              <span className="detail-card__value">
                {formatCurrency(row.investedBaloise)}
              </span>
              <span className="detail-card__sub">
                €{baloiseMonthly}/mnd
              </span>
            </div>
            <div className="detail-card">
              <span className="detail-card__label">Waarde</span>
              <span className="detail-card__value text-pension">
                {formatCurrency(row.valueBaloise)}
              </span>
              <span className="detail-card__sub">
                +{formatCurrency(row.valueBaloise - row.investedBaloise)} rente
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

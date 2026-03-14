import { useSettings } from '../../contexts/SettingsContext';
import { BIRTH_YEAR } from '../../../config/investment.config';

interface YearSelectorProps {
  value: number;
  onChange: (index: number) => void;
}

function getAge(year: number): number {
  return year - BIRTH_YEAR;
}

export function useCurrentYearIndex() {
  const { investmentYears } = useSettings();
  const now = new Date().getFullYear();
  const idx = investmentYears.findIndex((y) => y === now);
  return idx >= 0 ? idx : 0;
}

export function YearSelector({ value, onChange }: YearSelectorProps) {
  const { investmentYears } = useSettings();

  return (
    <div className="year-selector">
      <label className="year-selector__label" htmlFor="year-select">
        Selecteer jaar
      </label>
      <select
        id="year-select"
        className="year-selector__select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {investmentYears.map((year, i) => (
          <option key={i} value={i}>
            {year} — {getAge(year)} jaar
          </option>
        ))}
      </select>
      <span className="year-selector__hint">Berekeningen op basis van positie einde geselecteerd jaar</span>
    </div>
  );
}

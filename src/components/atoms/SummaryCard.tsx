interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'blue' | 'green' | 'purple' | 'orange';
}

export function SummaryCard({ label, value, sub, variant = 'blue' }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <div className="summary-card__label">{label}</div>
      <div className={`summary-card__value summary-card__value--${variant}`}>
        {value}
      </div>
      {sub && (
        <div className="summary-card__sub">
          {sub.split('·').map((part, i) => (
            <span key={i} className="summary-card__sub-line">{part.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

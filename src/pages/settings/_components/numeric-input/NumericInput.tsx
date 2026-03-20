import { useState, type FC, type InputHTMLAttributes } from 'react';

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  numericValue: number;
  onCommit: (value: number) => void;
  toDisplay?: (n: number) => number;
  fromDisplay?: (n: number) => number;
}

const NumericInput: FC<NumericInputProps> = ({ numericValue, onCommit, toDisplay, fromDisplay, ...rest }) => {
  const display = toDisplay ? toDisplay(numericValue) : numericValue;
  const [raw, setRaw] = useState<string | null>(null);

  return (
    <input
      {...rest}
      type="number"
      value={raw ?? String(display)}
      onFocus={() => setRaw(String(display))}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(raw ?? '');
        if (!isNaN(parsed)) {
          onCommit(fromDisplay ? fromDisplay(parsed) : parsed);
        }
        setRaw(null);
      }}
    />
  );
};

export { NumericInput };

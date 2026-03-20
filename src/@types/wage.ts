export interface WageEntry {
  date: string;
  year: number;
  month: number;
  included: boolean;
  gross: number | null;
  net: number | null;
  ratio: number | null;
  raise: number | null;
  premium: number | null;
  category: string | null;
  company: string;
  jobTitle: string;
  pc: number | null;
  note: string | null;
}

export interface YearlySummary {
  year: number;
  avgGross: number | null;
  avgNet: number | null;
  avgRatio: number | null;
  totalRaises: number;
  premium: number | null;
  company: string;
  jobTitle: string;
  entryCount: number;
}

export interface RaiseEvent {
  date: string;
  year: number;
  month: number;
  percentage: number;
  newGross: number | null;
  note: string | null;
  company: string;
}

export interface CompanyPeriod {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  startGross: number | null;
  endGross: number | null;
}

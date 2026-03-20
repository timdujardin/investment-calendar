import type { InvestmentRate } from '@/@types/investment';

export const RATE_OPTIONS: InvestmentRate[] = [5, 7, 10];

export const toPercent = (n: number) => Math.round(n * 10000) / 100;
export const fromPercent = (n: number) => n / 100;

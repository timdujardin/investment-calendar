import { cva, type VariantProps } from 'class-variance-authority';

export const summaryCardValue = cva('summary-card__value', {
  variants: {
    variant: {
      default: '',
      blue: 'summary-card__value--blue',
      green: 'summary-card__value--green',
      purple: 'summary-card__value--purple',
      orange: 'summary-card__value--orange',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type SummaryCardValueVariants = VariantProps<typeof summaryCardValue>;

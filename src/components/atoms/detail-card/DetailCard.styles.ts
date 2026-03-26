import { cva, type VariantProps } from 'class-variance-authority';

export const detailCard = cva('detail-card', {
  variants: {
    highlight: {
      true: 'detail-card--highlight',
    },
  },
});

export const detailCardValue = cva('detail-card__value', {
  variants: {
    extra: {
      success: 'detail-card__value--success',
    },
  },
});

export type DetailCardVariants = VariantProps<typeof detailCard>;

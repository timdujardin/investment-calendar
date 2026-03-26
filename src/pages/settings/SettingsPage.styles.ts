import { cva } from 'class-variance-authority';

export const rateButton = cva('settings-rate-group__btn', {
  variants: {
    active: {
      true: 'settings-rate-group__btn--active',
    },
  },
});

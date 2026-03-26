import { cva } from 'class-variance-authority';

export const monthRow = cva('', {
  variants: {
    muted: {
      true: 'bumba-table__row--muted',
    },
  },
});

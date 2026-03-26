import { cva } from 'class-variance-authority';

export const trackerCell = cva('tracker-cell', {
  variants: {
    status: {
      ok: 'tracker-cell--ok',
      warn: 'tracker-cell--warn',
    },
  },
});

export const trackerCellStatus = cva('tracker-cell__status', {
  variants: {
    status: {
      ok: 'tracker-cell__status--ok',
      warn: 'tracker-cell__status--warn',
    },
  },
});

export const targetSummaryValue = cva('target-summary__value target-summary__value--bold', {
  variants: {
    polarity: {
      positive: 'target-summary__value--positive',
      negative: 'target-summary__value--negative',
    },
  },
});

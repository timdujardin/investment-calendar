import { cva } from 'class-variance-authority';

export const dashboardStatus = cva('dashboard-status', {
  variants: {
    variant: {
      ok: 'dashboard-status--ok',
      warn: 'dashboard-status--warn',
      info: 'dashboard-status--info',
    },
  },
});

export const dashboardStatusRow = cva('', {
  variants: {
    highlight: {
      true: 'dashboard-status__row--highlight',
    },
  },
});

import { cva } from 'class-variance-authority';

export const bottomNavItem = cva('bottom-nav__item', {
  variants: {
    active: {
      true: 'bottom-nav__item--active',
    },
  },
});

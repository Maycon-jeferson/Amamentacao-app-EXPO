import { colors as baseColors } from './colors';

export const colors = baseColors;

export type Colors = typeof colors;

export const Fonts = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  rounded: 'System',
  mono: 'System',
  sizes: {
    title: 28,
    subtitle: 18,
    body: 16,
  },
} as const;

export type FontsType = typeof Fonts;

export const ColorsScheme = {
  light: {
    ...baseColors,
    icon: '#2D2A35',
  },
  dark: {
    ...baseColors,
    icon: '#FFFFFF',
  },
} as const;

export { ColorsScheme as Colors };


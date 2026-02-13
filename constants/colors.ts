/**
 * Paleta de cores do app - tema suave para acompanhamento de bebê
 */
export const colors = {
  // Fundos
  background: '#F5F0FA',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Primária (lavanda / lilás com tom rosa)
  primary: '#B87BA8',
  primaryLight: '#E8C4DC',
  primaryDark: '#8B5B82',

  // Destaque (rosa)
  accent: '#E8A5C8',
  accentLight: '#F5D8EB',
  accentDark: '#D47BA8',

  // Texto
  text: '#2D2A35',
  textSecondary: '#5C5666',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // Cards e bordas
  card: '#FFFFFF',
  cardBorder: '#E8E0F0',
  border: '#E0D8E8',

  // Estados
  success: '#7BA87B',
  warning: '#C9A86B',
  error: '#B85C5C',

  // Sombras (para shadowColor no iOS)
  shadow: '#6B5B8220',
} as const;

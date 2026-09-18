export type ColorScheme = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentDim: string;
  danger: string;
  dangerDim: string;
};

export const darkColors: ColorScheme = {
  bg: '#0B0D10',
  surface: '#15181D',
  surface2: '#1C2027',
  border: '#2A3038',
  text: '#F4F6F8',
  muted: '#8B939E',
  accent: '#3DDC97',
  accentDim: 'rgba(61, 220, 151, 0.14)',
  danger: '#E85D5D',
  dangerDim: 'rgba(232, 93, 93, 0.12)',
};

export const lightColors: ColorScheme = {
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  surface2: '#F1F3F5',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  accent: '#10B981',
  accentDim: 'rgba(16, 185, 129, 0.12)',
  danger: '#EF4444',
  dangerDim: 'rgba(239, 68, 68, 0.12)',
};

// Cores ativas por defeito (retrocompatibilidade com ficheiros estáticos)
export const colors = darkColors;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  full: 999,
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

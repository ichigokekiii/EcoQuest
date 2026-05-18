/** Design tokens for JS-only styling (e.g. SVG strokes). Tailwind mirrors these in tailwind.config.js */
export const colors = {
  primary: '#22C55E',
  primaryDark: '#15803D',
  primarySoft: '#DCFCE7',
  sage: '#A8C3A0',
  mint: '#CFE3C3',
  teal: '#407C8C',
  deepTeal: '#153D40',
  forest: '#0F2F34',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  info: '#3B82F6',
};

export const chartStrokeColors = {
  green: colors.success,
  blue: colors.info,
  yellow: colors.warning,
  red: colors.danger,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

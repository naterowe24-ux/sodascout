export const colors = {
  red:        '#E24B4A',
  redLight:   '#FCEBEB',
  redDark:    '#A32D2D',
  green:      '#3B6D11',
  greenLight: '#EAF3DE',
  greenMid:   '#639922',
  amber:      '#EF9F27',
  amberLight: '#FAEEDA',
  amberDark:  '#854F0B',
  teal:       '#0F6E56',
  tealLight:  '#E1F5EE',
  blue:       '#185FA5',
  blueLight:  '#E6F1FB',
  gray:       '#F1EFE8',
  grayMid:    '#5F5E5A',
  grayLight:  '#D3D1C7',
} as const;

export const sipScoreColors = {
  green: colors.green,   // 8.5+
  amber: colors.amber,   // 7.0–8.4
  red:   colors.redDark, // below 7.0
} as const;

export function getSipScoreColor(score: number): string {
  if (score >= 8.5) return sipScoreColors.green;
  if (score >= 7.0) return sipScoreColors.amber;
  return sipScoreColors.red;
}

export const fonts = {
  display: {
    bold:      'Syne_700Bold',
    extraBold: 'Syne_800ExtraBold',
  },
  body: {
    regular: 'DMSans_400Regular',
    medium:  'DMSans_500Medium',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

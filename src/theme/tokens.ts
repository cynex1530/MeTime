/**
 * Design tokens from the Me Time handoff — complete Light → Dark map.
 * Never render dark ink on a dark surface: every ink token has a dark remap.
 */

export type Theme = typeof light;

export const light = {
  isDark: false,

  // Surfaces
  bg: '#f2f2f7',
  card: '#ffffff',
  inkSurface: '#1c1c1e', // primary buttons, dark chips
  onInk: '#ffffff',

  // Text
  text: '#1c1c1e',
  textSecondary: 'rgba(60,60,67,0.6)',
  textTertiary: 'rgba(60,60,67,0.5)',
  textFaint: 'rgba(60,60,67,0.4)',

  // Hairlines & borders
  hairline: 'rgba(60,60,67,0.12)',
  hairlineStrong: 'rgba(60,60,67,0.25)',
  cardBorder: 'rgba(60,60,67,0.10)',

  // Frosted chrome
  tabBarBg: 'rgba(248,248,250,0.92)',
  popoverBg: 'rgba(250,250,252,0.96)',
  tabActive: '#1c1c1e',
  tabInactive: 'rgba(60,60,67,0.45)',

  // Segmented control (Him / Her / Anyone)
  segTrack: 'rgba(120,120,128,0.12)',
  segActiveBg: '#ffffff',
  segActiveText: '#1c1c1e',
  segInactiveText: 'rgba(60,60,67,0.6)',

  // Glass badges over photos — text stays dark in BOTH themes
  glassBadgeBg: 'rgba(255,255,255,0.85)',
  glassBadgeText: '#1c1c1e',

  // Misc
  destructive: '#e5484d',
  destructiveBorder: 'rgba(229,72,77,0.55)',
  grabber: 'rgba(60,60,67,0.25)',
  iconStroke: '#1c1c1e',
  iconMuted: 'rgba(60,60,67,0.55)',
  placeholderCaption: 'rgba(60,60,67,0.5)',
  placeholderRing: 'rgba(60,60,67,0.2)',
  placeholderFill: 'rgba(60,60,67,0.05)',
  scrim: 'rgba(0,0,0,0.4)',
  shadow: '#000000',
};

export const dark: Theme = {
  isDark: true,

  bg: '#121316',
  card: '#232529',
  inkSurface: '#3a3c42',
  onInk: '#ffffff',

  text: '#f2f2f7',
  textSecondary: 'rgba(235,235,245,0.6)',
  textTertiary: 'rgba(235,235,245,0.55)',
  textFaint: 'rgba(235,235,245,0.45)',

  hairline: 'rgba(235,235,245,0.14)',
  hairlineStrong: 'rgba(235,235,245,0.22)',
  // brighter so cards separate from the near-black background
  cardBorder: 'rgba(235,235,245,0.30)',

  tabBarBg: 'rgba(20,21,24,0.9)',
  popoverBg: 'rgba(32,33,37,0.98)',
  tabActive: '#f2f2f7',
  tabInactive: 'rgba(235,235,245,0.55)',

  segTrack: 'rgba(120,120,128,0.12)',
  segActiveBg: '#4c4e55',
  segActiveText: '#ffffff',
  segInactiveText: 'rgba(235,235,245,0.55)',

  glassBadgeBg: 'rgba(255,255,255,0.85)',
  glassBadgeText: '#1c1c1e', // stays dark on the light glass — do not flip

  destructive: '#e5484d',
  destructiveBorder: 'rgba(229,72,77,0.55)',
  grabber: 'rgba(235,235,245,0.45)',
  iconStroke: 'rgba(235,235,245,0.72)',
  iconMuted: 'rgba(235,235,245,0.55)',
  placeholderCaption: 'rgba(235,235,245,0.72)',
  placeholderRing: 'rgba(235,235,245,0.34)',
  placeholderFill: 'rgba(255,255,255,0.05)',
  scrim: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
};

/** Shared non-color constants */
export const radii = {
  button: 16,
  card: 16,
  tile: 20,
  sheet: 28,
  chip: 999,
};

export const layout = {
  gutter: 20,
  cardPad: 16,
  tabBarClearance: 110,
};

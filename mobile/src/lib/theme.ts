import { isRTL } from './i18n';

// Mirrors the web portal's tokens (primary = hsl(351 84% 48%), Barlow display + Inter body).
export const colors = {
  primary: '#E11432',
  primarySoft: '#FDECEF',
  primaryText: '#FFFFFF',
  background: '#F6F6F7',
  card: '#FFFFFF',
  text: '#0A0A0A',
  muted: '#6B7280',
  border: '#E5E7EB',
  input: '#F3F4F6',
  black: '#000000',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#2563EB',
  infoSoft: '#DBEAFE',
};

const LATIN_FONTS = {
  display: 'Barlow_800ExtraBold',
  displayBold: 'Barlow_700Bold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};
// Barlow/Inter have no Arabic letters, so Arabic uses Cairo.
const ARABIC_FONTS: typeof LATIN_FONTS = {
  display: 'Cairo_800ExtraBold',
  displayBold: 'Cairo_700Bold',
  body: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semibold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
};

/** Font names for the active language (read at render time). */
export const fonts = new Proxy(LATIN_FONTS, {
  get: (_, key: keyof typeof LATIN_FONTS) => (isRTL() ? ARABIC_FONTS : LATIN_FONTS)[key],
});

/** Arabic glyphs are taller, so fixed line heights need extra room. */
export const lh = (n: number) => (isRTL() ? Math.round(n * 1.35) : n);

export const radius = { sm: 8, md: 12, lg: 16, xl: 22 };

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const BELTS: { label: string; color: string }[] = [
  { label: 'White Belt', color: '#E5E7EB' },
  { label: 'Yellow Belt', color: '#FACC15' },
  { label: 'Green Belt', color: '#16A34A' },
  { label: 'Blue Belt', color: '#2563EB' },
  { label: 'Red Belt', color: '#B91C1C' },
  { label: 'Black Belt · 1st Dan', color: '#111111' },
  { label: 'Black Belt · 2nd Dan', color: '#111111' },
  { label: 'Black Belt · 3rd Dan', color: '#111111' },
];

export const images = {
  hero: require('../../assets/images/sarah_abu_jaish_and_islam_composite.jpg'),
  logo: require('../../assets/images/burkan1.png'),
  logo2: require('../../assets/images/burkan2.jpg'),
  islam: require('../../assets/images/islam_al_natsheh.jpg'),
  islam2: require('../../assets/images/islam_al_natsheh2.jpg'),
  mahmoud: require('../../assets/images/mahmoud_sqoor.jpg'),
  rama: require('../../assets/images/rama1.jpg'),
  sarah: require('../../assets/images/sarah_abu_jaish2.jpg'),
};

export type ImageKey = keyof typeof images;
export const imageFor = (key?: string | null) => (key && key in images ? images[key as ImageKey] : images.logo2);

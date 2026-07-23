import { Platform } from 'react-native';
import { colors } from './colors';

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });
const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
});

export const typography = {
  display: { fontFamily: serif, fontSize: 30, lineHeight: 38, color: colors.ink, fontWeight: '600' as const },
  title: { fontFamily: serif, fontSize: 22, lineHeight: 29, color: colors.ink, fontWeight: '600' as const },
  subtitle: { fontFamily: sans, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  body: { fontFamily: sans, fontSize: 16, lineHeight: 24, color: colors.ink },
  bodySoft: { fontFamily: sans, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  label: { fontFamily: sans, fontSize: 13, lineHeight: 18, color: colors.inkSoft, letterSpacing: 0.3 },
  caption: { fontFamily: sans, fontSize: 12, lineHeight: 16, color: colors.inkSoft },
  button: { fontFamily: sans, fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
};

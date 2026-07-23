import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

/** A quiet botanical accent — a single cherry sprig, not a mascot. */
export function CherrySprig({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M14 3C13 8 12 12 12 15" stroke={colors.mauve} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M14 5C16 6.5 18 6.5 19.5 5" stroke={colors.mauve} strokeWidth={1} strokeLinecap="round" fill="none" />
      <Circle cx="10.5" cy="19" r="4.2" fill={colors.cherry} />
      <Circle cx="16.5" cy="20.5" r="4.2" fill={colors.darkCherry} />
    </Svg>
  );
}

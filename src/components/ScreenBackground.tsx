import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { colors } from '@/theme';

interface ScreenBackgroundProps extends PropsWithChildren {
  /** Comfortable reading width on desktop; screens with a wider layout (e.g. Home's two columns) can override this. */
  maxWidth?: number;
}

const DEFAULT_DESKTOP_MAX_WIDTH = 760;

export function ScreenBackground({ children, maxWidth = DEFAULT_DESKTOP_MAX_WIDTH }: ScreenBackgroundProps) {
  const { isDesktop } = useResponsive();
  return (
    <LinearGradient
      colors={[colors.cream, colors.creamDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.2, y: 1 }}
      style={styles.fill}
    >
      <View style={styles.centerWrap}>
        <View style={[styles.inner, isDesktop && { maxWidth }]}>{children}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centerWrap: { flex: 1, alignItems: 'center', width: '100%' },
  inner: { flex: 1, width: '100%' },
});

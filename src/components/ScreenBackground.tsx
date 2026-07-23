import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export function ScreenBackground({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={[colors.cream, colors.creamDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.2, y: 1 }}
      style={styles.fill}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
